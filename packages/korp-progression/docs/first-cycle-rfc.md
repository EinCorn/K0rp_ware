# RFC — první auditní cyklus K0rp_OS

Verze: `0.2.0-core-loop-migration`  
Status: návrh datové migrace pro Tasks 020–024

## 0. Canonical source

Herní kontrakt určuje:

```text
docs/k0rp-os/20-core-loop.md
```

Tento package RFC popisuje, jak se má `packages/korp-progression` přestavět, aby strojová data odpovídala canonical loopu.

Machine-readable JSON/CSV na `main` po Tasku 019 stále obsahuje část v0.2 modelu `raw action → NWU/AP`. Dokud není dokončen Task 024, nesmí být tento starý výnos rozšiřován do dalších feature.

## 1. Canonical first-cycle loop

```text
Audit 00-A
→ ClickAudit unlock
→ raw click metric
→ ClickAudit packet
→ repeatable Audit 10-A instance
→ Evidence
→ Audit 16-C
→ Fidget authorization
→ Fidget raw metric
→ Fidget packet
→ repeatable audit
→ Evidence
→ backlog
→ delegation
```

## 2. Resource migration

Stávající technical ID zůstává:

```text
notionalWorkUnits
```

Player-facing metadata se změní na:

```json
{
  "label": "Evidence",
  "shortLabel": "EV",
  "kind": "currency",
  "spendable": true,
  "description": "Aktivita, kterou systém certifikoval jako vykazatelnou."
}
```

Nezavádět souběžný resource `evidence`, dokud není schválená plná core/save migration. Duplicitní resource by vytvořil dvě měny pro tutéž skutečnost.

## 3. Event migration

### `clickaudit.click`

Nový význam:

- raw count;
- source/profile stat;
- žádný přímý Evidence yield;
- žádný přímý Audit Pressure yield.

### `clickaudit.batchCompleted`

Nový význam:

- module-specific packet boundary;
- vytvoří právě jeden ClickAudit packet;
- nepřidává Evidence.

### `audit.formSubmitted`

Zůstává generic submit milestone.

### `audit.evidenceCertified`

Nový event:

```json
{
  "id": "audit.evidenceCertified",
  "moduleId": "system",
  "persistence": "milestone",
  "description": "Konkrétní metric packet byl jedním auditním záznamem uznán jako Evidence."
}
```

Event aplikuje Evidence podle `evidenceAmount` z audit template/effect resolveru.

### Future

```text
metric.packetCreated
audit.discrepancyRaised
delegation.activityGenerated
delegation.trainingCompleted
```

Generic packet event se nepřidává v Tasku 020, pokud by zdvojoval `clickaudit.batchCompleted`. Přidá se až s druhým packet source.

## 4. New data concepts

### Metric packet definition

Doporučený datový shape:

```ts
type MetricPacketDefinition = {
  id: string;
  metricType: string;
  sourceModuleId: string;
  closureEventType: string;
  quantity?: number;
  auditTemplateId: string;
  evidenceAmount: number;
};
```

První definice:

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

### Runtime packet instance

Definice není save state. Runtime instance ukládá:

```text
id
packetDefinitionId
source
quantity
status
createdAt
certifiedAt
```

### Repeatable audit instance

`audit-10-a` není pouze jednou submitted form ID. Každý pending packet má vlastní audit instance.

```text
audit-10-a/click-batch-0001
audit-10-a/click-batch-0002
```

Jednorázové formuláře dál používají `submittedFormIds`.

## 5. Audit form changes

### Audit 00-A

Zůstává:

```text
☐ Jsem v práci?
[POTVRDIT PŘÍTOMNOST]
```

Completion effects:

- unlock ClickAudit;
- unlock first memo;
- žádný Evidence grant;
- Evidence UI může zůstat skryté do první certifikace.

### Audit 10-A

Nový účel:

```text
certifikace konkrétní ClickAudit dávky
```

Minimální fields:

```text
Byla zaznamenaná aktivita provedena úmyslně?
○ Ano
○ Ne
○ Nelze potvrdit
[PODAT VÝKAZ]
```

Completion effects na audit instance:

- packet `pending → certified`;
- emit `audit.evidenceCertified`;
- Evidence +1;
- žádný jednorázový upgrade unlock jako primární smysl.

První validní odpovědi mají stejný Evidence výsledek. Odpověď se uchová pro budoucí interpretation/discrepancy systém.

### Audit 16-C

Nový requirement:

```text
Evidence >= 1
```

Nový efekt:

```text
allocate/spend 1 Evidence
→ authorize fidget
```

Fidget permit nemá vyžadovat současně vysoké NWU i Audit Pressure a další nákup za tutéž věc.

## 6. Upgrade catalog migration

Legacy upgrades, které předpokládají přímý ClickAudit currency yield, musí být v Tasku 024 přepsány nebo odloženy.

### `sys.audit-batch-standardization`

Stará role:

```text
form 10-A → batch size/reward upgrade
```

Nová role může být jedna z těchto, podle playtestu:

- implicitní procedure aktivovaná první certifikací;
- kosmetický/interpretation upgrade;
- větší packet capacity po několika certifikacích;
- odstranění z early required path.

Nesmí přidávat Evidence přímo za raw click.

### `click.secondary-evidence-column`

Může později měnit interpretation, discrepancy chance nebo audit copy. Nesmí jednoduše duplikovat jeden packet do dvou Evidence bez dalšího procesu.

### Passive relay

Pasivní relay musí emitovat `system-generated` activity. Nesmí navyšovat manual click counter a nesmí samo dokončit povinný audit.

## 7. Save migration

Task 020 zvýší save schema/progression data version.

Při načtení starého save:

```text
click batch baseline = aktuální raw click count
metricPackets = []
auditInstances = []
```

Důvod: hráč nesmí po aktualizaci dostat desítky retroaktivních packetů a Evidence.

Save ukládá:

```text
metric packet instances
audit instances
Evidence balance
manual/delegated/system stats
existing unlock/memo/form state
```

Save neukládá celé packet nebo audit template definice.

## 8. First-cycle balance migration

Původní 240–310min target je provisional. Nejprve se playtestuje:

```text
presence
→ first click packet
→ first Evidence
→ Fidget authorization
→ first Fidget packet
→ backlog
```

`first-cycle.balance.csv` a `first-cycle-phases.json` se přepíší až v Tasku 024 podle reálných milestone timestamps.

## 9. Data files affected by Task 024

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
```

Možné nové shards:

```text
data/shards/metric-packets.json
data/shards/audit-templates.json
```

Přidat je jen tehdy, pokud nebudou packet definitions přehledně součástí existující databáze.

## 10. Implementation order

```text
Task 020 — runtime Click packet → Audit 10-A → Evidence
Task 021 — Evidence authorization / Audit 16-C
Task 022 — asset-backed Fidget surface
Task 023 — Fidget packet + backlog
Task 024 — full data and balance reconciliation
Task 025 — delegation prototype after backlog playtest
```

## 11. Validation requirements

- referenced packet definitions exist;
- audit template IDs exist;
- packet definition references valid event/module/resource IDs;
- one packet cannot be certified twice;
- repeatable audit instances do not pollute one-time `submittedFormIds` semantics;
- save migration is deterministic;
- player-facing resource label is Evidence/EV;
- no early data path grants spendable Evidence from raw actions.
