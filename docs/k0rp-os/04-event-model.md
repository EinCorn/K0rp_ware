# K0rp_OS — Event Model

Verze: 0.3.0 pracovní návrh

## 1. Účel

Event model je způsob, jak K0rp_OS promění mikrointerakce v herní význam, aniž by zaměnil samotnou činnost za uznaný výsledek.

Klik, rotace, vyčištěný flek, dokončená vlna nebo potvrzený formulář nejsou stejný druh věci. Event model je rozděluje na:

```text
raw activation
→ metric closure
→ packet creation
→ audit submit
→ evidence certification
→ unlock / surface mutation
```

Canonical ekonomický kontrakt je v `20-core-loop.md`.

## 2. Základní principy

- Každý modul emituje eventy.
- UI akce nemá sama přímo měnit globální progress.
- Raw event zvyšuje doslovnou metriku nebo module-local stav.
- Spendable Evidence vzniká až certifikací packetu.
- Jeden uživatelský záměr smí vytvořit maximálně jeden odpovídající raw activation event.
- Pointer movement, render tick a animační frame nejsou gameplay eventy.
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

### 4.1 Raw activation

Doslovný úmyslný vstup:

```text
clickaudit.click
bloom.tileClicked
button.pressed
```

Raw activation:

- zvyšuje raw stat;
- může měnit lokální stav modulu;
- nepřidává přímo Evidence.

### 4.2 Natural closure / metric milestone

Ohraničený konec smysluplné lokální činnosti:

```text
fidget.sessionSettled
bloom.waveAdvanced
button.sequenceCompleted
corner.sessionCompleted
```

Natural closure může vytvořit auditovatelný packet, ale sama nemusí být spendable reward.

### 4.3 Packet creation

Packet je persistovaný záznam raw metriky čekající na audit.

První module-specific event:

```text
clickaudit.batchCompleted
```

Budoucí obecný event, až existuje více packet sources:

```text
metric.packetCreated
```

Jeden packet smí vzniknout právě jednou. Module-specific a generic event se nesmějí pro stejnou dávku zdvojit.

### 4.4 Audit submit

```text
audit.formSubmitted
```

Potvrzuje, že formulář byl podán. U packet auditu musí být navázán na konkrétní audit instance a packet.

### 4.5 Evidence certification

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

### 4.6 Discrepancy and delegation

Budoucí events:

```text
audit.discrepancyRaised
delegation.activityGenerated
delegation.trainingCompleted
```

Delegovaná aktivita musí mít jiný source než manual activity.

## 5. Základní state layers

Current `KorpState` může zůstat postupně rozšiřovaný, ale core loop potřebuje vedle resources/stats také:

```ts
metricPackets: MetricPacket[];
auditInstances: AuditInstance[];
```

Pragmatický shape:

```ts
type MetricPacket = {
  id: string;
  metricType: string;
  source: "manual" | "delegated" | "system-generated";
  quantity: number;
  status: "pending" | "certified" | "rejected";
  createdAt: number;
  auditTemplateId: string;
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

Definice templates se neukládají do save, pouze jejich ID a runtime state.

## 6. Resources

Globální resources zahrnují technical `notionalWorkUnits`, Audit Pressure, Stabilization, Compliance Integrity, Entropy, Perceived Productivity, System Order a Approval Units.

Pro player-facing early game:

```text
notionalWorkUnits → Evidence / EV
```

Evidence vzniká z `audit.evidenceCertified`, ne z raw clicku.

Audit Pressure má postupně vycházet z backlogu, stáří packetů, discrepancies a neověřené delegované aktivity, nikoliv z každého kliknutí.

Ne všechny resources musí být viditelné hned. Viditelnost je progression reward.

## 7. Current module events

### ClickAudit

```text
clickaudit.click
clickaudit.milestoneReached
clickaudit.sourceUpdated
clickaudit.reset
clickaudit.batchCompleted
```

Canonical význam:

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

`spinTick` je transient/local. `sessionSettled` je auditovatelný natural closure.

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

## 9. Resource and metric mapping

```text
ClickAudit
→ manual click raw metric
→ click packets
→ audit
→ Evidence

Fidget
→ rotations / sessionSettled raw metric
→ stabilization packets
→ audit
→ Evidence

Bloom
→ status changes / waveAdvanced raw metric
→ compliance packets
→ audit
→ Evidence

Button Compliance
→ presses / sequence raw metric
→ approval-local state
→ audit or authorization

Corner Watch
→ observation session raw metric
→ optional packet / idle report
```

Module-local resources zůstávají možné. Globální spendable Evidence ale nevzniká přímo ze základní akce.

## 10. Event privacy

Povolené:

```json
{
  "type": "clickaudit.click",
  "value": 1,
  "meta": { "profile": "window-drag-handle" }
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
- external active-window data.

> Event je pracovní záznam absurdity. Nesmí se z něj stát pracovní záznam člověka.

## 11. Persistence levels

### Transient

Pouze UI/session:

- pointer movement;
- animační frame;
- fyzikální tick;
- průběžná rotace spinneru;
- každý pixel wipe tahu.

### Raw gameplay

Doslovná agregovatelná aktivita:

- `clickaudit.click`;
- `bloom.tileClicked`;
- `button.pressed`;
- další úmyslné activations.

### Metric closure

- `clickaudit.batchCompleted`;
- `fidget.sessionSettled`;
- `bloom.waveAdvanced`;
- `corner.sessionCompleted`;
- `button.sequenceCompleted`.

### Audit milestone

- `audit.formSubmitted`;
- `audit.evidenceCertified`;
- `audit.discrepancyRaised`;
- `system.memoAcknowledged`;
- `system.shiftClosed`;
- `system.auditCycleClosed`.

## 12. Audit interaction bridge

Každá úmyslná field activation vytvoří právě jeden auditovaný raw click a změní lokální field state.

```text
audit checkbox changed
→ clickaudit.click(profile: active-audit-field)
→ audit local field state updated
```

Klik do hotového dokumentu může vytvořit `clickaudit.click(profile: completed-audit-body)`, ale nesmí znovu měnit auditní data.

Drag titlebaru:

```text
pointer down na drag handle
→ právě 1 clickaudit.click(profile: window-drag-handle)
→ libovolný pointer move
→ 0 dalších click events
```

## 13. Click packet flow

```text
25 nových raw ClickAudit clicks od batch baseline
→ clickaudit.batchCompleted
→ create packet
→ status pending
→ create/offer Audit 10-A instance
→ audit.formSubmitted
→ audit.evidenceCertified
→ packet status certified
→ Evidence +1
```

Idempotency guards musí zabránit:

- dvojitému packetu za stejný rozsah kliků;
- dvojité certifikaci;
- retroaktivnímu vytvoření packetů po save migration;
- double-countingu capture a explicit handleru.

## 14. Delegation source contract

Budoucí source categories:

```text
manual
delegated
system-generated
```

`delegated` nebo `system-generated` event nesmí zvyšovat `manualClicks`.

Dashboard může později agregovat všechny kategorie, ale musí je umět oddělit.

## 15. Surface mutation flow

```text
certification / authorization milestone
→ progression unlock
→ surface mutation
→ nový shortcut / folder / file / setting / screensaver
```

Surface mutation reprezentuje výsledek ekonomiky. Sama nesmí obcházet audit nebo autorizaci.

## 16. Migration status

Po Tasku 019 reducer a machine-readable data stále částečně mapují raw events přímo na resources.

Task 020 mění ClickAudit slice. Task 023 ověří druhý metric source. Task 024 sjednotí machine data, balance a docs.
