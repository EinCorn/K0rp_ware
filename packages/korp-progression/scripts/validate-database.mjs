import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const read = (filePath) =>
  JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));

const database = {
  resources: read("data/shards/resources.json"),
  events: read("data/shards/events.json"),
  auditForms: read("data/shards/audit-forms.json"),
  upgrades: [
    ...read("data/shards/upgrades-audit.json"),
    ...read("data/shards/upgrades-care.json"),
    ...read("data/shards/upgrades-confirmation.json"),
    ...read("data/shards/upgrades-cross.json"),
    ...read("data/shards/upgrades-idle.json"),
    ...read("data/shards/upgrades-stabilization.json"),
    ...read("data/shards/upgrades-system.json")
  ],
  certifications: read("data/shards/certifications.json"),
  crossModuleInteractions: read("data/shards/cross-module-interactions.json"),
  memos: read("data/shards/memos.json"),
  prestige: read("data/shards/prestige.json"),
  prestigeDirectives: read("data/shards/prestige-directives.json"),
  firstCyclePhases: read("data/shards/first-cycle-phases.json")
};

const issues = [];
const ids = {
  resourceId: new Set(database.resources.map((item) => item.id)),
  event: new Set(database.events.map((item) => item.id)),
  formId: new Set(database.auditForms.map((item) => item.id)),
  upgradeId: new Set(database.upgrades.map((item) => item.id)),
  memoId: new Set(database.memos.map((item) => item.id))
};
const resourcesById = new Map(
  database.resources.map((resource) => [resource.id, resource])
);
const EVIDENCE_AUTHORIZATION_RESOURCE_ID = "notionalWorkUnits";

const containsResourceRequirement = (
  requirement,
  resourceId,
  minimumAmount
) => {
  if (!requirement || typeof requirement !== "object") return false;

  if (requirement.kind === "resourceAtLeast") {
    return requirement.resourceId === resourceId
      && Number.isFinite(requirement.amount)
      && requirement.amount >= minimumAmount;
  }

  return requirement.kind === "all"
    && Array.isArray(requirement.requirements)
    && requirement.requirements.some((child) => (
      containsResourceRequirement(child, resourceId, minimumAmount)
    ));
};

for (const [name, rows] of Object.entries(database)) {
  if (!Array.isArray(rows)) continue;

  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row !== "object" || typeof row.id !== "string") {
      continue;
    }

    if (seen.has(row.id)) {
      issues.push(`${name}: duplicate id ${row.id}`);
    }
    seen.add(row.id);
  }
}

database.auditForms.forEach((form, index) => {
  if (form.authorization === undefined) return;

  const pathName = `auditForms[${index}].authorization`;
  const authorization = form.authorization;
  if (!authorization || typeof authorization !== "object") {
    issues.push(`${pathName}: expected an object`);
    return;
  }

  if (
    typeof authorization.moduleId !== "string"
    || authorization.moduleId.trim().length === 0
  ) {
    issues.push(`${pathName}.moduleId: expected a non-empty string`);
  }

  if (
    typeof authorization.resourceId !== "string"
    || authorization.resourceId.trim().length === 0
  ) {
    issues.push(`${pathName}.resourceId: expected a non-empty string`);
  } else if (authorization.resourceId !== EVIDENCE_AUTHORIZATION_RESOURCE_ID) {
    issues.push(`${pathName}.resourceId: expected notionalWorkUnits`);
  } else if (!resourcesById.has(authorization.resourceId)) {
    issues.push(`${pathName}.resourceId: expected a known resource`);
  } else if (resourcesById.get(authorization.resourceId).spendable !== true) {
    issues.push(`${pathName}.resourceId: resource must be spendable`);
  }

  if (!Number.isSafeInteger(authorization.cost) || authorization.cost <= 0) {
    issues.push(`${pathName}.cost: expected a positive safe integer`);
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
    issues.push(
      `${pathName}.resourceId: missing matching resourceAtLeast requirement`
    );
  }
});

const walk = (value, pathName = "database") => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${pathName}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") return;

  if (
    typeof value.resourceId === "string" &&
    !ids.resourceId.has(value.resourceId)
  ) {
    issues.push(`${pathName}.resourceId: unknown ${value.resourceId}`);
  }

  for (const key of [
    "eventType",
    "triggerEvent",
    "targetEvent",
    "sourceEvent"
  ]) {
    if (typeof value[key] === "string" && !ids.event.has(value[key])) {
      issues.push(`${pathName}.${key}: unknown ${value[key]}`);
    }
  }

  if (typeof value.formId === "string" && !ids.formId.has(value.formId)) {
    issues.push(`${pathName}.formId: unknown ${value.formId}`);
  }

  if (
    typeof value.upgradeId === "string" &&
    !ids.upgradeId.has(value.upgradeId)
  ) {
    issues.push(`${pathName}.upgradeId: unknown ${value.upgradeId}`);
  }

  if (typeof value.memoId === "string" && !ids.memoId.has(value.memoId)) {
    issues.push(`${pathName}.memoId: unknown ${value.memoId}`);
  }

  for (const [key, child] of Object.entries(value)) {
    walk(child, `${pathName}.${key}`);
  }
};

walk(database);

if (issues.length > 0) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log(
  `K0rp progression database valid: ${database.resources.length} resources, ` +
    `${database.events.length} events, ${database.auditForms.length} forms, ` +
    `${database.upgrades.length} upgrades, ${database.memos.length} memos.`
);
