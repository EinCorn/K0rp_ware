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
