# Integration map — napojení progression dat na K0rp_ware

Verze: `0.3.0 core-loop migration`

Tento soubor popisuje doporučený technický postup integrace canonical Metric → Audit → Evidence modelu.

Canonical design:

```text
docs/k0rp-os/20-core-loop.md
```

Aktuální runtime po Tasku 019 už má společný provider, persistence, Audit 00-A/10-A baseline a asset-backed ClickAudit. Další práce je migrace ekonomiky, ne přidání dalšího paralelního runtime.

## 1. Package boundary

```text
packages/korp-progression/
```

Package zůstává čistá datová vrstva:

- žádný React;
- žádný DOM;
- žádné Tauri API;
- žádný localStorage adapter;
- žádný window manager.

Deklaruje IDs, definitions, requirements, effects a validation.

## 2. Resource migration

Stávající technical ID:

```ts
notionalWorkUnits: number;
```

se v první migraci nepřejmenovává, aby se neštěpil core/save contract.

Player-facing metadata:

```text
Evidence / EV
```

Reducer semantics se mění:

```text
raw activation
≠ resource reward

audit.evidenceCertified
→ notionalWorkUnits / Evidence
```

Lifetime generated total zůstává ve stats, ale znamená lifetime certified Evidence, ne součet klikových pulse.

## 3. Runtime state additions

KorpRuntimeProvider potřebuje:

```ts
metricPackets: MetricPacket[];
auditInstances: AuditInstance[];
```

Doporučený pragmatický shape:

```ts
type MetricPacket = {
  id: string;
  packetDefinitionId: string;
  metricType: string;
  source: "manual" | "delegated" | "system-generated";
  quantity: number;
  status: "pending" | "certified" | "rejected";
  createdAt: number;
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

`submittedFormIds` zůstává pro one-time forms. Repeatable packet audits používají `auditInstances`.

## 4. New progression-bearing events

```text
audit.formSubmitted
clickaudit.batchCompleted
audit.evidenceCertified
fidget.sessionSettled
system.shiftClosed
system.memoAcknowledged
system.auditCycleClosed
```

Později:

```text
metric.packetCreated
audit.discrepancyRaised
delegation.activityGenerated
delegation.trainingCompleted
```

## 5. ClickAudit flow

### Raw click

```text
intentional K0rp_OS pointer down
→ clickaudit.click(profile/source)
→ raw click stat
```

Žádná Evidence ani přímý Audit Pressure.

### Batch boundary

```text
25 nových raw clicks od batch baseline
→ clickaudit.batchCompleted
→ create packet.clickaudit.manual-25 instance
```

Packet creation musí být idempotentní.

### Audit instance

```text
pending ClickAudit packet
→ offer/create Audit 10-A instance
→ local draft values
→ audit.formSubmitted
→ audit.evidenceCertified
→ packet certified
→ Evidence +1
```

Jedna vůle uživatele smí vytvořit maximálně jeden raw click. Jeden submit smí certifikovat maximálně jeden packet.

## 6. Audit interaction bridge

Aktivní field:

```text
audit field change
→ clickaudit.click(profile: active-audit-field)
→ local field state
```

Hotový audit body:

```text
click in completed document
→ clickaudit.click(profile: completed-audit-body)
→ no data mutation
```

Drag handle:

```text
pointer down
→ clickaudit.click(profile: window-drag-handle)
→ pointer move does not generate click events
```

## 7. Runtime provider contract

Doporučené minimum po Tasku 020:

```text
KorpRuntimeProvider
├─ korpState
├─ lifetimeStats
├─ dispatch(event)
├─ metricPackets
├─ auditInstances
├─ createMetricPacket()
├─ submitAuditInstance()
├─ certifyEvidence()
├─ authorization state
├─ unlock/memo queues
├─ save/load/reset
└─ migration helpers
```

Window positions, z-index, drag a minimize zůstávají presentation state v KorpOsShell.

## 8. Resolver order

Minimální pipeline:

```text
validate event
→ update raw stats/module-local state
→ detect natural closure/batch boundary
→ create packet once
→ evaluate audit availability
→ submit audit instance
→ certify packet once
→ grant/spend Evidence
→ apply authorization/unlocks
→ memos/surface mutations
→ save
```

Upgrade resolver nesmí přidávat všechna pravidla do jednoho obřího switch bez datových boundaries.

## 9. Initial module visibility

První spuštění:

```text
Audit 00-A = visible
ClickAudit = locked
Fidget = locked
Bloom = locked
```

Po Audit 00-A:

```text
ClickAudit = unlocked
Evidence = hidden until first certification nebo 0
pending audits = 0
```

Po první Evidence:

```text
Audit 16-C = available
```

Po Audit 16-C a Evidence allocation:

```text
Fidget = authorized/unlocked
```

## 10. Save migration

Zvýšit samostatně:

```ts
schemaVersion
progressionDataVersion
```

Při migraci v0.2 save:

```text
clickBatchBaseline = current raw click count
metricPackets = []
auditInstances = []
```

Důvod: neudělit retroaktivní packets/Evidence za starý prototypový click history.

Save ukládá:

```text
metric packet instances
audit instances
resources/stats
authorizations
owned upgrades
unlocked modules/memos
one-time submitted forms
```

Neukládá celé definitions.

## 11. Data migration tasks

### Task 020

Runtime + minimal data needed for ClickAudit packet and Audit 10-A.

### Task 021

Evidence authorization and Audit 16-C.

### Task 022

Asset-backed Fidget surface.

### Task 023

Fidget packet and shared backlog.

### Task 024

Full reconciliation:

- resources metadata;
- events;
- audit forms;
- upgrades;
- CSV balance;
- first-cycle phases;
- validation;
- docs/package parity.

## 12. What not to implement yet

- cloud sync;
- overlay;
- generic BPMN/workflow engine;
- all packet sources at once;
- all 37 upgrades at once;
- delegation before backlog playtest;
- procedurally generated audit prose;
- fake manual clicks from assistants;
- external raw activity telemetry.

## 13. Validation additions

Task 024 validation má kontrolovat:

- unique packet definition IDs;
- valid metric/event/module references;
- valid audit template references;
- valid Evidence resource reference;
- one-time versus repeatable audit semantics;
- no missing packet definition in first-cycle phases;
- no early direct raw-action currency effect;
- deterministic save migration version.
