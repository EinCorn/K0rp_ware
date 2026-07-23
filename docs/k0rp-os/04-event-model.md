# K0rp_OS — Event Model

Verze: 0.4.0 pracovní návrh

## 1. Účel

Event model proměňuje mikrointerakce a uzavřené module sessions v herní význam, aniž by zaměnil samotnou činnost za institucionálně uznaný výsledek.

Klik, natural settle, dokončená vlna, uzavřený incident, kvalifikovaný claim a potvrzený formulář nejsou stejný druh věci.

```text
raw activation
→ module-local state / run-local XP
→ natural closure
→ packet creation
→ audit submit
→ evidence certification
→ authorization / surface mutation
→ delegation / discrepancy
```

Canonical ekonomický kontrakt je v `20-core-loop.md`. Action-module strategie je v `21-activity-spectrum-and-arcade-modules.md`.

## 2. Základní principy

- Každý modul emituje eventy přes stabilní namespace.
- UI akce nemá sama přímo měnit globální progress.
- Raw event mění doslovnou metriku nebo module-local stav.
- Run-local XP smí měnit pouze současnou session.
- Spendable Evidence vzniká až certifikací packetu.
- Jeden uživatelský záměr smí vytvořit maximálně jeden odpovídající raw activation event.
- Pointer movement, render tick, animační frame a průběžný physics tick nejsou globální gameplay eventy.
- High-density modul může micro-events agregovat lokálně a do core emitovat pouze raw summary nebo closure.
- Event nesmí obsahovat citlivý externí kontext.

## 3. Základní typ eventu

```ts
export type KorpEvent = {
  id: string;
  timestamp: number;
  sourceModule: KorpModuleId;
  type: KorpEventType;
  value?: number;
  tags?: string[];
  meta?: Record<string, unknown>;
};
```

## 4. Semantic layers

### 4.1 Transient local state

Není persistovaný jako globální progression event:

- pointer coordinates;
- každý frame spinneru;
- každý projectile tick;
- každý nepřátelský pathfinding tick;
- průběžné velocity;
- každý pixel wipe tahu;
- dočasný run-local XP bar.

### 4.2 Raw activation

Doslovný úmyslný vstup nebo lokálně agregovatelná akce:

```text
clickaudit.click
bloom.tileClicked
button.pressed
priority.deflected
argument.responseLogged
```

Raw activation:

- zvyšuje raw stat nebo mění module-local state;
- může přidat run-local XP uvnitř stejné session;
- nepřidává přímo Evidence.

### 4.3 Natural closure / metric milestone

Ohraničený konec smysluplné lokální činnosti:

```text
fidget.sessionSettled
bloom.waveAdvanced
button.sequenceCompleted
corner.sessionCompleted
priority.sessionClosed
alignment.sessionClosed
```

Natural closure může vytvořit auditovatelný packet podle packet definition nebo baseline/cursor pravidla. Sama není spendable reward.

### 4.4 Packet creation

Packet je persistovaný záznam raw metriky čekající na audit.

První module-specific event:

```text
clickaudit.batchCompleted
```

Obecný event, pokud je používán:

```text
metric.packetCreated
```

Jeden packet smí vzniknout právě jednou. Module-specific a generic event se pro stejnou dávku nesmějí zdvojit.

### 4.5 Audit submit

```text
audit.formSubmitted
```

Potvrzuje, že konkrétní formulář nebo audit instance byl podán. U packet auditu musí existovat vazba na konkrétní packet.

### 4.6 Evidence certification

```text
audit.evidenceCertified
```

Minimální metadata:

```ts
{
  packetId: string;
  auditInstanceId: string;
  metricType: string;
  evidenceAmount: number;
}
```

Teprve tento event přidává player-facing Evidence.

### 4.7 Authorization

```text
authorization.granted
authorization.capabilityGroupGranted
```

Authorization:

- spotřebuje nebo alokuje Evidence podle declarative effectu;
- přidá persistentní flag;
- může spustit surface mutation;
- nesmí být zaměněna za module-local proficiency.

### 4.8 Delegation and discrepancy

```text
delegation.activityGenerated
delegation.trainingCompleted
audit.discrepancyRaised
policy.interventionRequested
```

Delegovaná aktivita má jiný source než manual activity a vlastní confidence/error contract.

## 5. State layers

Core loop potřebuje vedle resources/stats:

```ts
type MetricPacket = {
  id: string;
  metricType: string;
  source: "manual" | "delegated" | "system-generated";
  quantity: number;
  status: "pending" | "certified" | "rejected";
  createdAt: number;
  auditTemplateId: string;
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

Action modules smějí mít samostatný local/session shape:

```ts
type ModuleSessionState = {
  moduleId: string;
  sessionId: string;
  status: "briefing" | "active" | "choice" | "closing" | "closed";
  startedAt: number;
  runXp: number;
  selectedUpgradeIds: string[];
  localCounters: Record<string, number>;
};
```

`ModuleSessionState` není automaticky global save. Modul deklaruje, co se při zavření relace zahodí, co se uloží lokálně a jaký closure event odešle do core.

Definice templates a upgrade katalogů se do save nekopírují; ukládají se ID a stav.

## 6. Resources and values

Globální early player-facing currency:

```text
notionalWorkUnits → Evidence / EV
```

Evidence vzniká z `audit.evidenceCertified`, ne z raw eventu, run XP ani packet creation.

Meters:

- Audit Pressure;
- Entropy;
- Stabilization;
- Compliance Integrity;
- System Order.

Run-local XP je session pacing value, ne resource v `KorpState.resources`.

Audit Pressure má vycházet z backlogu, stáří packetů, discrepancies a neověřené delegované aktivity, nikoliv z každého kliknutí nebo každého projectile impactu.

## 7. Current module events

### ClickAudit

```text
clickaudit.click
clickaudit.milestoneReached
clickaudit.sourceUpdated
clickaudit.reset
clickaudit.batchCompleted
```

- `clickaudit.click` = doslovný raw click;
- `clickaudit.batchCompleted` = packet boundary, ne currency reward.

### Fidget

```text
fidget.spinStarted
fidget.spinTick
fidget.spinStopped
fidget.modeChanged
fidget.speedThresholdReached
fidget.sessionSettled
```

`spinTick`, pointer moves, frames a průběžné physics změny jsou transient/local. `fidget.sessionSettled` vzniká právě jednou po úmyslném pohybu a přirozeném doběhu. Sám nepřidává Evidence.

### Bloom

```text
bloom.tileClicked
bloom.matchCleared
bloom.waveAdvanced
bloom.redStoneSpawned
bloom.boardReset
```

`tileClicked` je raw activation. `waveAdvanced` je packet candidate.

## 8. Candidate module events

### Corner Watch

```text
corner.logoBounce
corner.nearMiss
corner.cornerHit
corner.speedChanged
corner.sessionCompleted
```

### Bublinková Fólie

```text
bubble.popped
bubble.defectivePressed
bubble.rareBubblePopped
bubble.sheetCompleted
bubble.sheetReplaced
```

### Button Compliance

```text
button.pressed
button.sequenceCompleted
button.confirmationConfirmed
button.falsePositive
button.panelReset
```

### Surface Compliance

```text
surface.wipeStroke
surface.dirtRemoved
surface.patchCleaned
surface.surfaceCompleted
surface.residueDetected
```

### Shape Compliance

```text
shape.dragStarted
shape.rotated
shape.snapped
shape.setCompleted
shape.misalignmentDetected
```

### Attention Runner

```text
runner.started
runner.jump
runner.obstacleAvoided
runner.comboReached
runner.runEnded
```

### Zenová Zahrádka

```text
zen.rakeStroke
zen.patternCompleted
zen.stoneMoved
zen.sandReset
zen.harmonyThresholdReached
```

### Newtonova Kolíbka

```text
cradle.pull
cradle.release
cradle.impact
cradle.cycleCompleted
cradle.motionEnded
cradle.responsibilityTransferred
```

### Priority Containment

Global candidate events:

```text
priority.deflected
priority.rerouted
priority.duplicateMerged
priority.escalationContained
priority.sessionClosed
priority.sessionExceeded
```

Implementation rule:

- každý collision nebo projectile tick zůstává local;
- core event se emituje jen pro player-meaningful raw activation, aggregate milestone nebo closure;
- `priority.sessionClosed` nese pouze aggregate privacy-safe summary;
- session local XP nesmí zvýšit Evidence.

Provisional packet candidate:

```text
2 priority.sessionClosed
→ priority-containment packet
→ Audit 27-P
→ Evidence +1 po certifikaci
```

Tento threshold není machine-readable contract, dokud greybox neprojde playtestem.

### Alignment Rally

```text
argument.responseLogged
argument.qualifierAttached
argument.claimSplit
argument.commitmentCreated
alignment.sessionClosed
alignment.sentOffline
```

Provisional packet candidate:

```text
3 alignment.sessionClosed
→ alignment packet
→ Audit 31-R
→ Evidence +1 po certifikaci
```

Text claimu se nesmí ukládat do globální telemetry. Event používá pouze interní template/claim ID a aggregate outcome.

## 9. Metric mapping

```text
ClickAudit
→ manual clicks
→ ClickAudit packets
→ Audit 10-A
→ Evidence

Fidget
→ sessionSettled
→ packet po 3 closures
→ Audit 18-S
→ Evidence

Bloom
→ waveAdvanced
→ Bloom packet
→ audit
→ Evidence

Priority Containment
→ sessionClosed / aggregate operational outcomes
→ packet až po prototype gate
→ Audit 27-P
→ Evidence

Alignment Rally
→ sessionClosed / closure outcome
→ packet až po prototype gate
→ Audit 31-R
→ Evidence
```

Module-local score, run XP, combo, build level a cosmetic unlock nejsou globální Evidence.

## 10. Event privacy

Povolené:

```json
{
  "type": "priority.sessionClosed",
  "value": 1,
  "meta": {
    "source": "manual",
    "outcome": "closed-with-reservation",
    "waveCount": 5
  }
}
```

Zakázané:

- souřadnice;
- app names mimo K0rp;
- URL;
- window titles;
- viditelný text;
- screenshots;
- raw klávesy;
- external active-window data;
- plný input replay;
- custom text claimu zadaný hráčem.

> Event je pracovní záznam absurdity. Nesmí se z něj stát pracovní záznam člověka.

## 11. Audit interaction bridge

Aktivní field:

```text
audit field change
→ právě 1 clickaudit.click(profile: active-audit-field)
→ local field state
```

Hotový audit:

```text
click in completed document
→ clickaudit.click(profile: completed-audit-body)
→ no data mutation
```

Drag handle:

```text
pointer down
→ právě 1 clickaudit.click(profile: window-drag-handle)
→ pointer move does not generate click events
```

## 12. Current packet flows

### ClickAudit

```text
25 nových raw clicks od baseline
→ clickaudit.batchCompleted
→ pending packet
→ Audit 10-A
→ audit.evidenceCertified
→ Evidence +1
```

### Fidget

```text
3 nové fidget.sessionSettled
→ fidget-sessions-<rangeStart>-<rangeEnd>
→ pending Audit 18-S
→ audit.evidenceCertified
→ Evidence +1
```

Vytvoření packetu neotevírá okno ani nepřebírá focus. ClickAudit a Fidget používají jednu pending queue.

## 13. Idempotency guards

Musí zabránit:

- dvojitému packetu za stejný range;
- dvojité certifikaci;
- retroaktivnímu packetu po migration;
- double-countingu capture a explicit handleru;
- opakovanému closure eventu za stejnou module session;
- dvojitému Evidence rewardu z module-specific i generic packet eventu.

## 14. Delegation source contract

```text
manual
delegated
system-generated
```

`delegated` ani `system-generated` event nesmí zvyšovat manual counters.

Action-module policy může vytvořit delegated session, ale musí zachovat:

- source;
- confidence;
- applied policy ID;
- outcome;
- případnou discrepancy vazbu.

## 15. Surface mutation flow

```text
certification / authorization milestone
→ progression unlock
→ surface mutation
→ nový shortcut / folder / file / policy surface / screensaver
```

Surface mutation reprezentuje výsledek ekonomiky. Nesmí obcházet audit nebo autorizaci.

## 16. Implementation status

- Task 023 dokončil druhý metric source a mixed backlog.
- Task 024 zůstává data/rebalance reconciliation.
- Priority Containment a Alignment Rally jsou pouze design/prototype candidates.
- Jejich event IDs se nesmějí přidat do machine-readable progression dat před samostatným greybox gate a schváleným integration taskem.
