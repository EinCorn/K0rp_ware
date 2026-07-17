import type { ProgressionDatabase } from "./progression.types";

export type ValidationIssue = {
  path: string;
  message: string;
};

const walk = (
  value: unknown,
  path: string,
  visitor: (value: unknown, path: string) => void
): void => {
  visitor(value, path);

  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, visitor));
    return;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walk(child, `${path}.${key}`, visitor);
    }
  }
};

const duplicateIds = (
  rows: readonly { id: string }[],
  path: string
): ValidationIssue[] => {
  const seen = new Set<string>();
  const issues: ValidationIssue[] = [];

  for (const row of rows) {
    if (seen.has(row.id)) {
      issues.push({ path, message: `Duplicate id: ${row.id}` });
    }
    seen.add(row.id);
  }

  return issues;
};

const containsResourceRequirement = (
  requirement: unknown,
  resourceId: string,
  minimumAmount: number
): boolean => {
  if (requirement === null || typeof requirement !== "object") return false;

  const record = requirement as Record<string, unknown>;
  if (record.kind === "resourceAtLeast") {
    return record.resourceId === resourceId
      && typeof record.amount === "number"
      && Number.isFinite(record.amount)
      && record.amount >= minimumAmount;
  }

  if (record.kind !== "all" || !Array.isArray(record.requirements)) return false;
  return record.requirements.some((child) => (
    containsResourceRequirement(child, resourceId, minimumAmount)
  ));
};

const EVIDENCE_AUTHORIZATION_RESOURCE_ID = "notionalWorkUnits";

export const validateProgressionDatabase = (
  database: ProgressionDatabase
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  const resourceIds = new Set(database.resources.map((item) => item.id));
  const eventIds = new Set(database.events.map((item) => item.id));
  const formIds = new Set(database.auditForms.map((item) => item.id));
  const upgradeIds = new Set(database.upgrades.map((item) => item.id));
  const memoIds = new Set(database.memos.map((item) => item.id));

  issues.push(
    ...duplicateIds(database.resources, "resources"),
    ...duplicateIds(database.events, "events"),
    ...duplicateIds(database.auditForms, "auditForms"),
    ...duplicateIds(database.upgrades, "upgrades"),
    ...duplicateIds(database.memos, "memos"),
    ...duplicateIds(database.certifications, "certifications"),
    ...duplicateIds(database.crossModuleInteractions, "crossModuleInteractions"),
    ...duplicateIds(database.prestigeDirectives, "prestigeDirectives"),
    ...duplicateIds(database.firstCyclePhases, "firstCyclePhases")
  );

  database.auditForms.forEach((form, index) => {
    if (form.authorization === undefined) return;

    const path = `auditForms[${index}].authorization`;
    const rawAuthorization = form.authorization as unknown;
    if (
      rawAuthorization === null
      || typeof rawAuthorization !== "object"
      || Array.isArray(rawAuthorization)
    ) {
      issues.push({ path, message: "Authorization must be an object" });
      return;
    }
    const authorization = rawAuthorization as Record<string, unknown>;

    if (
      typeof authorization.moduleId !== "string"
      || authorization.moduleId.trim().length === 0
    ) {
      issues.push({
        path: `${path}.moduleId`,
        message: "Authorization moduleId must be a non-empty string"
      });
    }

    if (
      typeof authorization.resourceId !== "string"
      || authorization.resourceId.trim().length === 0
    ) {
      issues.push({
        path: `${path}.resourceId`,
        message: "Authorization resourceId must be a non-empty string"
      });
    } else if (authorization.resourceId !== EVIDENCE_AUTHORIZATION_RESOURCE_ID) {
      issues.push({
        path: `${path}.resourceId`,
        message: "Evidence authorization resource must be notionalWorkUnits"
      });
    } else {
      const resource = database.resources.find((item) => (
        item.id === authorization.resourceId
      ));
      if (!resource) {
        issues.push({
          path: `${path}.resourceId`,
          message: "Authorization resource must reference a known resource"
        });
      } else if (resource.spendable !== true) {
        issues.push({
          path: `${path}.resourceId`,
          message: "Authorization resource must be spendable"
        });
      }
    }

    if (
      typeof authorization.cost !== "number"
      || !Number.isSafeInteger(authorization.cost)
      || authorization.cost <= 0
    ) {
      issues.push({
        path: `${path}.cost`,
        message: "Authorization cost must be a positive safe integer"
      });
      return;
    }

    if (
      typeof authorization.resourceId === "string"
      && !containsResourceRequirement(
        form.requirements,
        authorization.resourceId,
        authorization.cost
      )
    ) {
      issues.push({
        path: `${path}.resourceId`,
        message: "Authorization must have a matching resourceAtLeast requirement"
      });
    }
  });

  walk(database, "database", (value, path) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return;
    }

    const record = value as Record<string, unknown>;

    if (typeof record.resourceId === "string" && !resourceIds.has(record.resourceId)) {
      issues.push({
        path: `${path}.resourceId`,
        message: `Unknown resource: ${record.resourceId}`
      });
    }

    for (const key of ["eventType", "triggerEvent", "targetEvent", "sourceEvent"]) {
      const candidate = record[key];
      if (typeof candidate === "string" && !eventIds.has(candidate)) {
        issues.push({
          path: `${path}.${key}`,
          message: `Unknown event: ${candidate}`
        });
      }
    }

    if (typeof record.formId === "string" && !formIds.has(record.formId)) {
      issues.push({
        path: `${path}.formId`,
        message: `Unknown form: ${record.formId}`
      });
    }

    if (typeof record.upgradeId === "string" && !upgradeIds.has(record.upgradeId)) {
      issues.push({
        path: `${path}.upgradeId`,
        message: `Unknown upgrade: ${record.upgradeId}`
      });
    }

    if (typeof record.memoId === "string" && !memoIds.has(record.memoId)) {
      issues.push({
        path: `${path}.memoId`,
        message: `Unknown memo: ${record.memoId}`
      });
    }
  });

  return issues;
};

export const assertValidProgressionDatabase = (
  database: ProgressionDatabase
): void => {
  const issues = validateProgressionDatabase(database);

  if (issues.length > 0) {
    const details = issues
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid K0rp progression database:\n${details}`);
  }
};

export const calculateFirstAuditFindings = (
  certifiedDepartments: number,
  lifetimeNotionalWorkUnits: number
): number => {
  const certificationBonus = Math.max(
    0,
    Math.min(3, certifiedDepartments - 2)
  );
  const highOutputBonus = lifetimeNotionalWorkUnits >= 600 ? 1 : 0;

  return Math.min(7, 3 + certificationBonus + highOutputBonus);
};
