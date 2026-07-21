# RFC — první auditní cyklus K0rp_OS

Verze: `0.4.0-core-loop-reconciliation`  
Status: runtime Tasks 020–023 dokončené; Task 024 je následující machine-readable data migration

## 0. Canonical sources

```text
docs/k0rp-os/20-core-loop.md
docs/k0rp-os/17-first-cycle-balance.md
docs/k0rp-os/07-roadmap.md
```

Budoucí activity/action proposal:

```text
docs/k0rp-os/21-activity-spectrum-and-arcade-modules.md
```

Tento package RFC popisuje pouze první auditní cyklus a datovou parity migration. Priority Containment a Alignment Rally nejsou součást Tasku 024.

## 1. Current runtime loop

Runtime po Tasku 023 / PR #45 používá:

```text
Audit 00-A
→ ClickAudit unlock + baseline
→ first post-unlock click
→ bootstrap ClickAudit packet quantity 1
→ repeatable Audit 10-A
→ Evidence +1
→ Audit 16-C
→ allocate 1 Evidence
→ Fidget authorization
→ 3 new fidget.sessionSettled
→ Fidget packet
→ repeatable Audit 18-S
→ Evidence +1
→ mixed backlog
```

Pozdější ClickAudit packets:

```text
25 new manual clicks
→ quantity-25 packet
→ Audit 10-A queue
```

Machine-readable JSON/CSV stále obsahují část v0.2 `raw action → NWU/AP` modelu. Task 024 musí odstranit tento rozpor.

## 2. Resource migration

Technical ID zůstává:

```text
notionalWorkUnits
```

Player-facing metadata:

```json
{
  "label": "Evidence",
  "shortLabel": "EV",
  "kind": "currency",
  "spendable": true,
  "description": "Aktivita, kterou systém certifikoval jako vykazatelnou."
}
```

Nezavádět paralelní `evidence` resource bez plné core/save migration.

Run-local XP budoucích action modules není nový global resource a do tohoto package tasku nepatří.

## 3. Event reconciliation

### Raw events

```text
clickaudit.click
fidget.sessionSettled
```

Musí:

- aktualizovat raw/stat state;
- zachovat source semantics;
- neposkytovat Evidence;
- neposkytovat direct Audit Pressure reward.

### Packet boundary

```text
clickaudit.batchCompleted
metric.packetCreated nebo equivalent Fidget packet resolver
```

Vytvoří právě jeden packet. Nepřidává Evidence.

### Form submit

```text
audit.formSubmitted
```

Zůstává generic submit milestone. U repeatable packet auditu vyžaduje vazbu na packet.

### Evidence certification

```text
audit.evidenceCertified
```

Minimální data:

```json
{
  "packetId": "string",
  "auditInstanceId": "string",
  "metricType": "string",
  "evidenceAmount": 1
}
```

Teprve tento event přidává Evidence.

### Fidget direct-yield removal

Staré `fidget.sessionSettled` resource yields, zejména `notionalWorkUnits`, musí být v Tasku 024 odstraněny nebo přepsány tak, aby raw closure pouze přispěla k packet detectoru.

## 4. Packet definitions

Doporučený shape:

```ts
type MetricPacketDefinition = {
  id: string;
  metricType: string;
  sourceModuleId: string;
  closureEventType: string;
  quantity: number;
  auditTemplateId: string;
  evidenceAmount: number;
};
```

### ClickAudit bootstrap

```json
{
  "id": "packet.clickaudit.bootstrap-1",
  "metricType": "clickaudit.click",
  "sourceModuleId": "click-audit",
  "closureEventType": "clickaudit.batchCompleted",
  "quantity": 1,
  "auditTemplateId": "audit-10-a",
  "evidenceAmount": 1
}
```

Bootstrap se vytváří pouze jednou po Audit 00-A. Definition sama nesmí způsobit každou quantity-1 dávku.

### ClickAudit normal

```json
{
  "id": "packet.clickaudit.manual-25",
  "metricType": "clickaudit.click",
  "sourceModuleId": "click-audit",
  "closureEventType": "clickaudit.batchCompleted",
  "quantity": 25,
  "auditTemplateId": "audit-10-a",
  "evidenceAmount": 1
}
```

### Fidget

```json
{
  "id": "packet.fidget.manual-sessions-3",
  "metricType": "fidget.sessionSettled",
  "sourceModuleId": "fidget",
  "closureEventType": "metric.packetCreated",
  "quantity": 3,
  "auditTemplateId": "audit-18-s",
  "evidenceAmount": 1
}
```

Implementation může používat generic resolver bez explicitního generic eventu, pokud by event vedl k double creation. Data musí popsat jediný source of packet creation.

## 5. Runtime instances

Packet instance ukládá:

```text
id
packetDefinitionId nebo equivalent metric metadata
source
quantity/range
status
createdAt
certifiedAt
```

Audit instance ukládá:

```text
id
templateId
packetId
status
values
createdAt
submittedAt
```

Repeatable audits nesmějí používat one-time `submittedFormIds` jako jediný stav.

## 6. Forms

### Audit 00-A

- one-time;
- unlock ClickAudit;
- baseline + bootstrap arm;
- first memo;
- no EV.

### Audit 10-A

- repeatable;
- konkrétní ClickAudit packet;
- validní answers mohou mít stejný first-slice EV result;
- answer se uchová pro pozdější interpretation/discrepancy;
- exactly-once certification.

### Audit 16-C

- one-time authorization;
- requirement `Evidence >= 1`;
- allocate/spend exactly 1 EV;
- grant persistent Fidget authorization;
- idempotent.

### Audit 18-S

- repeatable;
- konkrétní Fidget packet;
- exactly-once certification;
- EV +1 po validním submitu;
- packet creation does not auto-open.

## 7. Upgrade migration

Legacy upgrades s přímým raw yieldem musí být:

- přepsány na packet/audit capacity/interpretation;
- přesunuty do pozdější fáze;
- nebo odstraněny z early required path.

Zakázané:

- manual click multiplier;
- raw Fidget settle → EV;
- passive relay zvyšující manual counter;
- duplicate Evidence za jeden packet bez dalšího procesu.

Capability groups budoucích action modules se v Tasku 024 nevytvářejí.

## 8. Save migration status

Dokončené runtime migrations zachovávají:

- ClickAudit packets/audits;
- Fidget baseline/packets/audits;
- EV;
- authorizations;
- one-time forms;
- no retroactive packets.

Task 024 má změnit progression data version a zajistit, že:

- loaded data definitions odpovídají runtime;
- staré direct-yield definitions se nepoužijí;
- stávající save neztratí EV nebo authorization;
- nový data version nevyrobí packets/rewards zpětně.

## 9. First-cycle balance scope

Task 024 upravuje:

```text
presence
→ bootstrap ClickAudit packet
→ first EV
→ Fidget authorization
→ first Fidget packet
→ mixed backlog
→ delegation prerequisite metadata
```

Původní 240–310 min prestige target zůstává provisional.

Task 024 nebalanceuje:

- Priority Containment;
- Alignment Rally;
- action run XP;
- Audit 27-P;
- Audit 31-R;
- action capability groups.

Tyto systémy se do progression package přidají až po standalone prototype/playtest a samostatném integration tasku.

## 10. Data files affected by Task 024

```text
data/shards/resources.json
data/shards/events.json
data/shards/audit-forms.json
data/shards/upgrades-audit.json
data/shards/upgrades-stabilization.json
data/shards/first-cycle-phases.json
data/first-cycle.balance.csv
data/upgrade-catalog.csv
src/progression.types.ts
src/progression.database.ts
src/progression.validation.ts
docs/first-cycle-rfc.md
docs/integration-map.md
```

Možné nové files:

```text
data/shards/metric-packets.json
data/shards/audit-templates.json
```

Přidat pouze pokud zjednoduší single source of truth a reference validation.

## 11. Implementation order

```text
Task 020 — Click packet → Audit 10-A → EV          DONE
Task 021 — Audit 16-C / Fidget authorization       DONE
Task 022 — asset-backed Fidget                     DONE
Task 023 — Fidget packet / Audit 18-S / backlog    DONE
Task 024 — data/balance reconciliation             NEXT
Task 025 — delegation after backlog product gate
```

Visual Tasks 024A–024D jsou samostatná asset/window osa a nesmějí měnit progression semantics.

## 12. Validation requirements

- referenced packet definitions exist;
- audit template IDs exist;
- module/event/resource IDs exist;
- one packet cannot be certified twice;
- repeatable audit instances remain separate from one-time forms;
- raw event definitions have no early spendable EV yield;
- Fidget raw closure has no direct NWU/EV yield;
- CSV/JSON/TypeScript parity;
- save migration deterministic;
- player-facing label Evidence/EV;
- action candidate IDs absent until approved integration task.

## 13. Důležité pravidlo

> Progression package popisuje uznané procesy. Nesmí dopředu certifikovat hru, která ještě neprošla vlastním greyboxem.
