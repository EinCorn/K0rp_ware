# K0rp_OS — Event Model

Verze: 0.1.3 pracovní návrh

## 1. Účel

Event model je způsob, jak K0rp_OS promění mikrointerakce v herní význam.

Klik, prasklá bublina, vyčištěný flek, zapadnutý tvar nebo odražené logo nejsou jen UI akce. Jsou to záznamy v procedurální liturgii systému.

## 2. Princip

Každý modul emituje eventy. `korp-core` eventy zpracuje a převede je na:

- resources,
- stats,
- progress,
- unlocks,
- achievements,
- failures,
- internal memos,
- stav systému.

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

Globální resources:

```ts
export type KorpResources = {
  notionalWorkUnits: number;
  auditPressure: number;
  stabilization: number;
  complianceIntegrity: number;
  entropy: number;
  perceivedProductivity: number;
  systemOrder: number;
  idleFaith: number;
  reliefUnits: number;
  approvalUnits: number;
  cleanliness: number;
  alignment: number;
  attentionResidue: number;
  proceduralCalm: number;
  momentum: number;
  transferredResponsibility: number;
};
```

Poznámka: ne všechny resources musí být viditelné hned. Některé mohou být hidden / unlocked later.

## 6. Current v0.3 module events

### ClickAudit

```ts
"clickaudit.click"
"clickaudit.milestoneReached"
"clickaudit.sourceUpdated"
"clickaudit.reset"
```

Produces:

- auditPressure,
- notionalWorkUnits,
- perceivedProductivity.

### Fidget

```ts
"fidget.spinStarted"
"fidget.spinTick"
"fidget.spinStopped"
"fidget.modeChanged"
"fidget.speedThresholdReached"
```

Produces:

- stabilization,
- entropy reduction,
- perceivedControl.

### Bloom

```ts
"bloom.tileClicked"
"bloom.matchCleared"
"bloom.waveAdvanced"
"bloom.redStoneSpawned"
"bloom.boardReset"
```

Produces:

- complianceIntegrity,
- systemOrder,
- bloomIntegrity.

## 7. Candidate module events

### Corner Watch

```ts
"corner.logoBounce"
"corner.nearMiss"
"corner.cornerHit"
"corner.speedChanged"
"corner.sessionCompleted"
```

Produces:

- idleFaith,
- patienceUnits,
- perceivedProductivity.

Core joke: čekání je forma účasti.

### Bublinková Fólie

```ts
"bubble.popped"
"bubble.defectivePressed"
"bubble.rareBubblePopped"
"bubble.sheetCompleted"
"bubble.sheetReplaced"
```

Produces:

- reliefUnits,
- pressureReleased,
- stabilization,
- entropy reduction.

Core joke: fake wellness product měřený jako výkon.

### Button Compliance

```ts
"button.pressed"
"button.sequenceCompleted"
"button.confirmationConfirmed"
"button.falsePositive"
"button.panelReset"
```

Produces:

- approvalUnits,
- auditPressure,
- kryptoManagementScore.

Core joke: potvrzení potvrzení potvrzuje připravenost potvrdit.

### Surface Compliance

```ts
"surface.wipeStroke"
"surface.dirtRemoved"
"surface.patchCleaned"
"surface.surfaceCompleted"
"surface.residueDetected"
```

Produces:

- cleanliness,
- complianceIntegrity,
- systemOrder.

Core joke: povrch je čistý, příčina zůstává.

### Shape Compliance

```ts
"shape.dragStarted"
"shape.rotated"
"shape.snapped"
"shape.setCompleted"
"shape.misalignmentDetected"
```

Produces:

- alignment,
- closure,
- systemOrder.

Core joke: tvar zapadl, význam nebyl vyžadován.

### Attention Runner

```ts
"runner.started"
"runner.jump"
"runner.obstacleAvoided"
"runner.comboReached"
"runner.runEnded"
```

Produces:

- attentionResidue,
- dopamineDrift,
- notionalWorkUnits.

Core joke: pozornost se udržuje tím, že se rozdělí na nepoužitelné části.

### Zenová Zahrádka

```ts
"zen.rakeStroke"
"zen.patternCompleted"
"zen.stoneMoved"
"zen.sandReset"
"zen.harmonyThresholdReached"
```

Produces:

- proceduralCalm,
- sandAlignment,
- entropy reduction,
- systemOrder.

Core joke: klid byl aplikován na povrch, vnitřní stav zůstává v šetření.

### Newtonova Kolíbka

```ts
"cradle.pull"
"cradle.release"
"cradle.impact"
"cradle.cycleCompleted"
"cradle.motionEnded"
"cradle.responsibilityTransferred"
```

Produces:

- momentum,
- transferredResponsibility,
- idleFaith,
- perceivedProductivity.

Core joke: hybnost byla předána, odpovědnost nikoli. Nebo možná právě ano.

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

## 9. Example reducer rules

```ts
if (event.type === "clickaudit.click") {
  state.resources.auditPressure += 1;
  state.resources.notionalWorkUnits += 0.1;
}

if (event.type === "bubble.popped") {
  state.resources.reliefUnits += 1;
  state.resources.entropy = Math.max(0, state.resources.entropy - 0.05);
}

if (event.type === "corner.cornerHit") {
  state.resources.idleFaith += 50;
  unlockMemo("corner-incident-001");
}

if (event.type === "cradle.responsibilityTransferred") {
  state.resources.transferredResponsibility += 1;
  state.resources.perceivedProductivity += 0.5;
}
```

## 10. Unlock rules

Unlocky se mají vázat na resources a cross-module chování.

Příklady:

```text
200 Audit Pressure → unlock Button Compliance
10 Idle Faith → unlock Corner Watch memo
100 Relief Units → unlock red Relaxation Sheet skin
5 completed Surface Compliance sessions → unlock Cleaning Incident memo
500 Momentum → unlock Newton Cradle desk object for K0rp_OS desktop
```

Cross-module unlock:

```text
100 ClickAudit clicks + 1 completed Bubble Sheet → unlock memo „Wellbeing Audit“
10 Corner near misses + 1 Newton motion ended → unlock achievement „Almost Meaningful“
5 Zen patterns + 5 Bloom waves → unlock department „Care & Alignment“
```

## 11. Event privacy

Eventy nesmí obsahovat citlivý obsah.

Povolené:

```json
{
  "type": "system.externalWorkPulse",
  "value": 1,
  "meta": { "mode": "privacyWorkBlob" }
}
```

Zakázané:

```json
{
  "type": "system.externalAppUsed",
  "meta": {
    "appName": "...",
    "url": "...",
    "windowTitle": "..."
  }
}
```

## 12. Důležité pravidlo

> Event je pracovní záznam absurdity. Nesmí se z něj stát pracovní záznam člověka.
