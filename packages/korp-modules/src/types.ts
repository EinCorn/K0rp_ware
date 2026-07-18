export const KORP_MODULE_IDS = [
  "click-audit",
  "fidget",
  "bloom",
  "corner-watch",
  "bubble-wrap",
  "button-compliance",
  "surface-compliance",
  "shape-compliance",
  "attention-runner",
  "zen-garden",
  "newton-cradle"
] as const;

export const KORP_MODULE_CATEGORIES = [
  "audit",
  "stabilization",
  "care",
  "alignment",
  "idle",
  "attention",
  "system"
] as const;

export const KORP_MODULE_SURFACES = [
  "standalone",
  "osWindow",
  "overlay",
  "web"
] as const;

export const KORP_MODULE_STATUSES = ["current", "candidate", "future"] as const;

export const KORP_MODULE_RESOURCE_KEYS = [
  "notionalWorkUnits",
  "auditPressure",
  "stabilization",
  "complianceIntegrity",
  "entropy",
  "perceivedProductivity",
  "systemOrder",
  "idleFaith",
  "reliefUnits",
  "approvalUnits",
  "cleanliness",
  "alignment",
  "attentionResidue",
  "proceduralCalm",
  "momentum",
  "transferredResponsibility",
  "perceivedControl",
  "bloomIntegrity",
  "patienceUnits",
  "pressureReleased",
  "kryptoManagementScore",
  "closure",
  "dopamineDrift",
  "sandAlignment"
] as const;

export type KorpModuleId = (typeof KORP_MODULE_IDS)[number];
export type KorpModuleCategory = (typeof KORP_MODULE_CATEGORIES)[number];
export type KorpModuleSurface = (typeof KORP_MODULE_SURFACES)[number];
export type KorpModuleStatus = (typeof KORP_MODULE_STATUSES)[number];
export type KorpModuleResourceKey = (typeof KORP_MODULE_RESOURCE_KEYS)[number];

/**
 * Older planning documents use the term "maturity". In the registry it is
 * represented by the same current/candidate/future lifecycle as `status`.
 */
export type KorpModuleMaturity = KorpModuleStatus;

export type KorpModuleEventType =
  | `clickaudit.${"click" | "milestoneReached" | "sourceUpdated" | "reset"}`
  | `fidget.${"spinStarted" | "spinTick" | "spinStopped" | "modeChanged" | "speedThresholdReached" | "sessionSettled"}`
  | `bloom.${"tileClicked" | "matchCleared" | "waveAdvanced" | "redStoneSpawned" | "boardReset"}`
  | `corner.${"logoBounce" | "nearMiss" | "cornerHit" | "speedChanged" | "sessionCompleted"}`
  | `bubble.${"popped" | "defectivePressed" | "rareBubblePopped" | "sheetCompleted" | "sheetReplaced"}`
  | `button.${"pressed" | "sequenceCompleted" | "confirmationConfirmed" | "falsePositive" | "panelReset"}`
  | `surface.${"wipeStroke" | "dirtRemoved" | "patchCleaned" | "surfaceCompleted" | "residueDetected"}`
  | `shape.${"dragStarted" | "rotated" | "snapped" | "setCompleted" | "misalignmentDetected"}`
  | `runner.${"started" | "jump" | "obstacleAvoided" | "comboReached" | "runEnded"}`
  | `zen.${"rakeStroke" | "patternCompleted" | "stoneMoved" | "sandReset" | "harmonyThresholdReached"}`
  | `cradle.${"pull" | "release" | "impact" | "cycleCompleted" | "motionEnded" | "responsibilityTransferred"}`;

export type KorpModuleCopy = {
  readonly locale: "cs-CZ";
  readonly title: string;
  readonly shortDescription: string;
};

export type KorpModuleManifest = {
  readonly id: KorpModuleId;
  readonly title: string;
  readonly shortDescription: string;
  readonly copy: KorpModuleCopy;
  readonly category: KorpModuleCategory;
  readonly status: KorpModuleStatus;
  readonly supportedSurfaces: readonly KorpModuleSurface[];
  readonly emittedEventTypes: readonly KorpModuleEventType[];
  readonly producedResourceKeys: readonly KorpModuleResourceKey[];
};
