# K0rp_OS — Event Model

Verze: 0.2.0 pracovní návrh

## 1. Účel

Event model je způsob, jak K0rp_OS promění mikrointerakce v herní význam.

Klik, prasklá bublina, vyčištěný flek, zapadnutý tvar nebo odražené logo nejsou jen UI akce. Jsou to záznamy v procedurální liturgii systému.

## 2. Princip

Každý modul emituje eventy. `korp-core` eventy zpracuje a převede je na resources, stats, progress, unlocks, achievements, failures, internal memos a stav systému.

UI akce nikdy nemá sama přímo měnit globální progress. Vždy přes event.

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

## 4. Základní state

```ts
export type KorpState = {
  version: string;
  employeeId: string;
  createdAt: number;
  updatedAt: number;
  resources: KorpResources;
  stats: KorpStats;
  unlocks: KorpUnlockState;
  modules: Record<KorpModuleId, KorpModuleState>;
  settings: KorpSettings;
};
```

## 5. Resources

Globální resources zahrnují NWU, Audit Pressure, Stabilization, Compliance Integrity, Entropy, Perceived Productivity, System Order a Approval Units. Další module-local, lifetime a hidden resources jsou definované v `packages/korp-progression/data/shards/resources.json`.

Ne všechny resources musí být viditelné hned. Viditelnost je progression reward.

## 6. Current v0.3 module events

### ClickAudit

```text
clickaudit.click
clickaudit.milestoneReached
clickaudit.sourceUpdated
clickaudit.reset
clickaudit.batchCompleted
```

### Fidget

```text
fidget.spinStarted
fidget.spinTick
fidget.spinStopped
fidget.modeChanged
fidget.speedThresholdReached
fidget.sessionSettled
```

### Bloom

```text
bloom.tileClicked
bloom.matchCleared
bloom.waveAdvanced
bloom.redStoneSpawned
bloom.boardReset
```

## 7. Candidate module events

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

## 8. Resource mapping — draft

```text
ClickAudit          → Audit Pressure, Notional Work Units
Fidget              → Stabilization, Entropy Reduction
Bloom               → Compliance Integrity, System Order
Corner Watch        → Idle Faith, Patience Units
Bublinková Fólie    → Relief Units, Pressure Released
Button Compliance   → Approval Units, Krypto-management Score
Surface Compliance  → Cleanliness, Compliance Integrity
Shape Compliance    → Alignment, Closure
Attention Runner    → Attention Residue, Dopamine Drift
Zenová Zahrádka     → Procedural Calm, Sand Alignment
Newtonova Kolíbka   → Momentum, Transferred Responsibility
Work Blob           → Notional Work Units
```

## 9. Event privacy

Eventy nesmí obsahovat citlivý obsah.

Povolené:

```json
{
  "type": "system.externalWorkPulse",
  "value": 1,
  "meta": { "mode": "privacyWorkBlob" }
}
```

Zakázané jsou app names, URL, window titles, text, screenshots nebo raw klávesy.

## 10. Důležité pravidlo

> Event je pracovní záznam absurdity. Nesmí se z něj stát pracovní záznam člověka.

## 11. Event persistence levels

### Transient

Pouze UI/session:

- pointer movement;
- animační frame;
- fyzikální tick;
- průběžná rotace spinneru;
- každý pixel wipe tahu.

### Gameplay

Agregovaná herní událost:

- `surface.patchCleaned`;
- `bubble.batchPopped`;
- `fidget.rotationCompleted`;
- `clickaudit.batchCompleted`.

### Milestone

Persistovaný event pro unlocky, mema a surface mutations:

- `audit.formSubmitted`;
- `fidget.sessionSettled`;
- `bloom.waveAdvanced`;
- `bubble.sheetCompleted`;
- `system.shiftClosed`;
- `system.auditCycleClosed`.

## 12. První audit a globální ClickAudit stopa

Každá úmyslná interakce uvnitř auditního formuláře vytváří právě jeden `clickaudit.click` s profilem `audit-form`.

Stejná zásada platí napříč moduly: semantický stisk nebo volba může vytvořit nepřímý auditovaný klik, ale systém nesmí počítat render ticks ani pasivní animaci.

```text
audit checkbox changed
→ clickaudit.click(profile: audit-form)
→ audit local field state updated

bloom tile selected
→ bloom.tileClicked
→ clickaudit.click(profile: indirect-module)
```

## 13. Doporučené nové progression eventy

```text
audit.formSubmitted
clickaudit.batchCompleted
fidget.sessionSettled
system.memoAcknowledged
system.shiftClosed
system.auditCycleClosed
system.identityAssigned
```

Přidávají se postupně spolu s konkrétní implementací a testy; dokument sám nemění současný reducer.

## 14. Resource metadata

Progression package deklaruje kind, visibility, min/max, spendability, reset scope a offline behavior. Globální taskbar nemá ukazovat všechny resources.

## 15. Surface mutation flow

```text
milestone event
→ progression unlock
→ surface mutation
→ nový shortcut / folder / file / taskbar widget / setting / screensaver
```

Surface mutation nemění ekonomiku. Je to reprezentace jejího výsledku na fiktivní pracovní ploše.
