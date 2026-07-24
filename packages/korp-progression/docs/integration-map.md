# Integration map — napojení progression dat na K0rp_ware

Verze: `0.4.0 / post-Task-023 reconciliation map`

Canonical design:

```text
docs/k0rp-os/20-core-loop.md
```

Future module strategy:

```text
docs/k0rp-os/21-activity-spectrum-and-arcade-modules.md
```

Runtime po Tasku 023 už obsahuje ClickAudit i Fidget packets, repeatable audits, Evidence certification, authorization a mixed backlog. Task 024 sjednotí machine-readable package data. Nesmí vzniknout další paralelní runtime.

## 1. Package boundary

```text
packages/korp-progression/
```

Package je čistá datová vrstva:

- žádný React/DOM/Canvas;
- žádné Tauri API;
- žádný localStorage adapter;
- žádný window manager;
- žádný action physics loop;
- žádné raw design assets.

Deklaruje:

- IDs;
- resources;
- events;
- forms/templates;
- packet definitions;
- requirements/effects;
- authorizations;
- surface artifacts;
- validation;
- balance/progression data.

## 2. Resource semantics

Technical ID:

```ts
notionalWorkUnits: number;
```

Player-facing:

```text
Evidence / EV
```

```text
raw activation
≠ Evidence

run-local XP
≠ Evidence

audit.evidenceCertified
→ notionalWorkUnits / Evidence
```

Lifetime generated total znamená lifetime certified Evidence, ne raw pulse count.

## 3. Runtime state

Current minimum:

```ts
type MetricPacket = {
  id: string;
  packetDefinitionId?: string;
  metricType: string;
  source: "manual" | "delegated" | "system-generated";
  quantity: number;
  status: "pending" | "certified" | "rejected";
  createdAt: number;
  rangeStart?: number;
  rangeEnd?: number;
  certifiedAt?: number;
};

type AuditInstance = {
  id: string;
  templateId: string;
  packetId?: string;
  status: "available" | "draft" | "submitted" | "closed";
  values: Record<string, unknown>;
  createdAt: number;
  submittedAt?: number;
};
```

Runtime provider dále drží:

```text
clickBatchBaseline
fidgetSessionBatchBaseline
authorization state
mixed pending count
debug-only derived pressure
save/migration helpers
```

`submittedFormIds` zůstává pro one-time forms. Repeatable packet audits používají `auditInstances`.

## 4. Current progression-bearing events

```text
audit.formSubmitted
clickaudit.batchCompleted
audit.evidenceCertified
fidget.sessionSettled
system.shiftClosed
system.memoAcknowledged
system.auditCycleClosed
```

Future:

```text
metric.packetCreated
audit.discrepancyRaised
delegation.activityGenerated
delegation.trainingCompleted
policy.interventionRequested
```

Priority/Alignment candidate event IDs se nepřidávají do package před Tasks 035/038.

## 5. ClickAudit flow

### Baseline and bootstrap

```text
Audit 00-A submit
→ clickBatchBaseline = current raw click count
→ bootstrap armed once
```

```text
first later intentional K0rp click
→ clickaudit.click
→ quantity-1 bootstrap packet
→ Audit 10-A auto-open once
```

### Normal packets

```text
25 new raw clicks from cursor
→ clickaudit.batchCompleted
→ create quantity-25 packet once
→ queue Audit 10-A without focus steal
```

### Certification

```text
Audit 10-A valid submit
→ audit.formSubmitted
→ audit.evidenceCertified
→ packet certified
→ EV +1 exactly once
```

## 6. Fidget flow

### Natural closure

```text
meaningful intentional spin
→ natural coast-down
→ exactly 1 fidget.sessionSettled
→ raw settled-session stat
```

Pointer moves, frames, physics ticks a open/close neemitují closure. Raw settle nepřidává EV.

### Packet boundary

```text
3 new fidget.sessionSettled from baseline
→ create fidget-sessions-<rangeStart>-<rangeEnd>
→ create/offer Audit 18-S
→ mixed pending queue
```

Packet size `3` je current fixed provisional/playtestable value.

Packet creation:

- exactly once;
- preserves remainder;
- neotevírá audit window;
- nebere focus;
- nepřidává EV.

### Certification

```text
Audit 18-S valid submit
→ audit.formSubmitted
→ audit.evidenceCertified
→ packet certified
→ EV +1 exactly once
```

## 7. Audit interaction bridge

Active field:

```text
field change
→ exactly 1 clickaudit.click(profile: active-audit-field)
→ local draft mutation
```

Completed body:

```text
click
→ clickaudit.click(profile: completed-audit-body)
→ no audit data mutation
```

Drag handle:

```text
pointer down
→ exactly 1 clickaudit.click(profile: window-drag-handle)
→ pointer move = 0 additional clicks
```

## 8. Resolver order

```text
validate event
→ update raw stats/module-local state
→ detect natural closure/batch boundary
→ create packet once
→ evaluate audit availability
→ submit audit instance
→ certify packet once
→ grant/spend EV
→ apply authorization/unlocks
→ queue memos/surface mutations
→ save
```

Run-local XP budoucího action module zůstává před aggregate closure a nikdy nevstupuje přímo do EV resolveru.

## 9. Runtime/presentation boundary

Provider vlastní:

- resources/stats;
- packets;
- audit instances;
- authorizations;
- progression effects;
- save/migrations.

Presentation vlastní:

- window positions;
- z-index;
- drag;
- minimize/close;
- active/inactive state;
- module-local visual state tam, kde není progression-bearing.

Action `SessionEngine` bude module-local. Do provideru emituje pouze privacy-safe raw aggregate/closure.

## 10. Initial visibility

First boot:

```text
Audit 00-A = visible
ClickAudit = locked
Fidget = locked
Bloom = locked
future action modules = absent, ne vystavené jako locked cards
```

After Audit 00-A:

```text
ClickAudit = unlocked
bootstrap = armed
EV UI = hidden/0 until first certification
```

After first EV:

```text
Audit 16-C = available
```

After Audit 16-C:

```text
Fidget = authorized
```

## 11. Save migration

Separate versions:

```ts
schemaVersion
progressionDataVersion
```

Current schema 5 migration:

```text
preserve ClickAudit packets/audits
preserve EV/authorization/unlocks
fidgetSessionBatchBaseline = current historical settled count
new retroactive Fidget packets = 0
```

Task 024 progression-data migration:

- update data version;
- preserve valid runtime state;
- remove old direct-yield assumptions;
- create zero retroactive packets/rewards;
- keep definitions outside save.

## 12. Debug pressure

Current Task 023 derivation:

```text
clamp(0, 100,
  pendingCount * 10
  + floor(oldestPendingAgeMinutes / 10)
  + discrepancyCount * 20)
```

Debug-only. Provider jej nesmí zapisovat do persistent `resources.auditPressure`.

## 13. Task status

```text
Task 020 — Click packet / Audit 10-A / EV          DONE
Task 021 — Audit 16-C / Fidget authorization       DONE
Task 022 — asset-backed Fidget                     DONE
Task 023 — Fidget packet / Audit 18-S / backlog    DONE / PR #45
Task 024 — data and balance reconciliation         NEXT
Task 025 — delegation after backlog playtest
```

Visual Tasks 024A–024D:

- oddělená UI/assets osa;
- nemění progression semantics;
- Task 024A je merged / PR #47.

Future action Tasks 031–038:

- nejdřív module-local standalone greybox;
- package IDs až při OS integration;
- žádný direct EV;
- žádný action packet threshold před playtestem.

## 14. Task 024 affected data

- resources metadata;
- events/direct yields;
- audit forms/templates;
- packet definitions/references;
- authorizations;
- upgrade assumptions;
- first-cycle phases/CSV;
- TypeScript exports/types;
- validation;
- package docs.

Task 024 nesmí přidat:

- Priority Containment;
- Alignment Rally;
- Audit 27-P;
- Audit 31-R;
- run-local XP resource;
- action capability groups.

## 15. Validation

Task 024:

- unique packet definition IDs;
- valid metric/event/module/resource references;
- valid audit template references;
- one-time versus repeatable form semantics;
- no early raw-action EV effect;
- no Fidget raw direct yield;
- exactly-once certification;
- deterministic data/save migration;
- CSV/JSON/TS parity;
- action candidate IDs absent.

Future action integration:

- session closure exactly once;
- no per-frame global dispatch;
- run XP not global;
- privacy-safe aggregate event;
- accepted packet threshold;
- authorization/surface reference parity.

## 16. Důležité pravidlo

> Progression package má popsat to, co systém uznává. Simulation může být hlučná, rychlá a plná priorit. Do package vstoupí až její schválený closure, packet a auditní důsledek.
