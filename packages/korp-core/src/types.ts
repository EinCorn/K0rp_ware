export type KorpModuleId =
  | "click-audit"
  | "fidget"
  | "bloom"
  | "corner-watch"
  | "bubble-wrap"
  | "button-compliance"
  | "surface-compliance"
  | "shape-compliance"
  | "attention-runner"
  | "zen-garden"
  | "newton-cradle"
  | "system"
  | (string & {});

export type KorpEventType =
  | "clickaudit.click"
  | "clickaudit.milestoneReached"
  | "clickaudit.sourceUpdated"
  | "clickaudit.reset"
  | "clickaudit.batchCompleted"
  | "audit.formSubmitted"
  | "audit.evidenceCertified"
  | "fidget.spinStarted"
  | "fidget.spinTick"
  | "fidget.spinStopped"
  | "fidget.modeChanged"
  | "fidget.speedThresholdReached"
  | "fidget.sessionSettled"
  | "bloom.tileClicked"
  | "bloom.matchCleared"
  | "bloom.waveAdvanced"
  | "bloom.redStoneSpawned"
  | "bloom.boardReset"
  | "corner.logoBounce"
  | "corner.nearMiss"
  | "corner.cornerHit"
  | "corner.speedChanged"
  | "corner.sessionCompleted"
  | "bubble.popped"
  | "bubble.defectivePressed"
  | "bubble.rareBubblePopped"
  | "bubble.sheetCompleted"
  | "bubble.sheetReplaced"
  | "button.pressed"
  | "button.sequenceCompleted"
  | "button.confirmationConfirmed"
  | "button.falsePositive"
  | "button.panelReset"
  | "surface.wipeStroke"
  | "surface.dirtRemoved"
  | "surface.patchCleaned"
  | "surface.surfaceCompleted"
  | "surface.residueDetected"
  | "shape.dragStarted"
  | "shape.rotated"
  | "shape.snapped"
  | "shape.setCompleted"
  | "shape.misalignmentDetected"
  | "runner.started"
  | "runner.jump"
  | "runner.obstacleAvoided"
  | "runner.comboReached"
  | "runner.runEnded"
  | "zen.rakeStroke"
  | "zen.patternCompleted"
  | "zen.stoneMoved"
  | "zen.sandReset"
  | "zen.harmonyThresholdReached"
  | "cradle.pull"
  | "cradle.release"
  | "cradle.impact"
  | "cradle.cycleCompleted"
  | "cradle.motionEnded"
  | "cradle.responsibilityTransferred"
  | "system.externalWorkPulse"
  | (string & {});

export type KorpEvent = {
  id: string;
  timestamp: number;
  sourceModule: KorpModuleId;
  type: KorpEventType;
  value?: number;
  tags?: string[];
  meta?: Record<string, unknown>;
};

export type KorpResourceId = keyof KorpResources;

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
  perceivedControl: number;
  bloomIntegrity: number;
  patienceUnits: number;
  pressureReleased: number;
  kryptoManagementScore: number;
  closure: number;
  dopamineDrift: number;
  sandAlignment: number;
};

export type KorpStats = {
  totalEvents: number;
  eventsByType: Partial<Record<KorpEventType, number>>;
  eventsByModule: Partial<Record<KorpModuleId, number>>;
  lastEventAt?: number;
};

export type KorpUnlockRequirement =
  | { kind: "resourceAtLeast"; resource: KorpResourceId; amount: number }
  | { kind: "eventCountAtLeast"; eventType: KorpEventType; count: number }
  | { kind: "all"; requirements: KorpUnlockRequirement[] };

export type KorpUnlockDefinition = {
  id: string;
  title: string;
  requirement: KorpUnlockRequirement;
};

export type KorpUnlockState = {
  unlockedIds: string[];
  unlockedAt: Record<string, number>;
};

export type KorpModuleState = {
  enabled: boolean;
  visible: boolean;
  localProgress: Record<string, number>;
};

export type KorpSettings = {
  language: "cs-CZ" | "en-US";
  platform: "windows" | "mac" | "web" | "unknown";
  privacyMode: "localOnly" | "privacyWorkBlob";
};

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
