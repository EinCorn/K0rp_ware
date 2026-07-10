import type {
  KorpModuleCategory,
  KorpModuleManifest,
  KorpModuleStatus,
  KorpModuleSurface
} from "./types";

const withCzechCopy = (
  manifest: Omit<KorpModuleManifest, "copy">
): KorpModuleManifest => ({
  ...manifest,
  copy: {
    locale: "cs-CZ",
    title: manifest.title,
    shortDescription: manifest.shortDescription
  }
});

export const defaultModuleRegistry = [
  withCzechCopy({
    id: "click-audit",
    title: "ClickAudit",
    shortDescription: "Měří kliky, vyhodnocuje přítomnost a optimalizuje nic.",
    category: "audit",
    status: "current",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "clickaudit.click",
      "clickaudit.milestoneReached",
      "clickaudit.sourceUpdated",
      "clickaudit.reset"
    ],
    producedResourceKeys: ["auditPressure", "notionalWorkUnits", "perceivedProductivity"]
  }),
  withCzechCopy({
    id: "fidget",
    title: "Fidget",
    shortDescription: "Nástroj pro stabilizaci rozptýlením.",
    category: "stabilization",
    status: "current",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "fidget.spinStarted",
      "fidget.spinTick",
      "fidget.spinStopped",
      "fidget.modeChanged",
      "fidget.speedThresholdReached"
    ],
    producedResourceKeys: ["stabilization", "perceivedControl"]
  }),
  withCzechCopy({
    id: "bloom",
    title: "Bloom",
    shortDescription: "Nechte drobné myšlenky růst do měřitelných problémů.",
    category: "care",
    status: "current",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "bloom.tileClicked",
      "bloom.matchCleared",
      "bloom.waveAdvanced",
      "bloom.redStoneSpawned",
      "bloom.boardReset"
    ],
    producedResourceKeys: ["complianceIntegrity", "systemOrder", "bloomIntegrity"]
  }),
  withCzechCopy({
    id: "corner-watch",
    title: "Corner Watch — Rohové Očekávání",
    shortDescription: "Čekejte na roh v souladu s interními hodnotami.",
    category: "idle",
    status: "candidate",
    supportedSurfaces: ["standalone", "osWindow", "overlay", "web"],
    emittedEventTypes: [
      "corner.logoBounce",
      "corner.nearMiss",
      "corner.cornerHit",
      "corner.speedChanged",
      "corner.sessionCompleted"
    ],
    producedResourceKeys: ["idleFaith", "patienceUnits", "perceivedProductivity"]
  }),
  withCzechCopy({
    id: "bubble-wrap",
    title: "Bublinková Fólie",
    shortDescription: "Relaxační fólie nenahrazuje odpočinek. Odpočinek nebyl schválen.",
    category: "stabilization",
    status: "candidate",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "bubble.popped",
      "bubble.defectivePressed",
      "bubble.rareBubblePopped",
      "bubble.sheetCompleted",
      "bubble.sheetReplaced"
    ],
    producedResourceKeys: ["reliefUnits", "pressureReleased", "stabilization"]
  }),
  withCzechCopy({
    id: "button-compliance",
    title: "Button Compliance — Oddělení Opakovaného Souhlasu",
    shortDescription: "Potvrzení čeká na potvrzení.",
    category: "audit",
    status: "candidate",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "button.pressed",
      "button.sequenceCompleted",
      "button.confirmationConfirmed",
      "button.falsePositive",
      "button.panelReset"
    ],
    producedResourceKeys: ["approvalUnits", "auditPressure", "kryptoManagementScore"]
  }),
  withCzechCopy({
    id: "surface-compliance",
    title: "Surface Compliance — Povrchová Náprava",
    shortDescription: "Povrch je clean. Příčina zůstává v pending review.",
    category: "care",
    status: "future",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "surface.wipeStroke",
      "surface.dirtRemoved",
      "surface.patchCleaned",
      "surface.surfaceCompleted",
      "surface.residueDetected"
    ],
    producedResourceKeys: ["cleanliness", "complianceIntegrity", "systemOrder"]
  }),
  withCzechCopy({
    id: "shape-compliance",
    title: "Shape Compliance — Tvarová Konformita",
    shortDescription: "Tvar zapadl. Význam nebyl vyžadován.",
    category: "alignment",
    status: "future",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "shape.dragStarted",
      "shape.rotated",
      "shape.snapped",
      "shape.setCompleted",
      "shape.misalignmentDetected"
    ],
    producedResourceKeys: ["alignment", "closure", "systemOrder"]
  }),
  withCzechCopy({
    id: "attention-runner",
    title: "Attention Runner — Rozdělená Pozornost",
    shortDescription: "Sub-task běží. Main task nebyl identifikován.",
    category: "attention",
    status: "future",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "runner.started",
      "runner.jump",
      "runner.obstacleAvoided",
      "runner.comboReached",
      "runner.runEnded"
    ],
    producedResourceKeys: ["attentionResidue", "dopamineDrift", "notionalWorkUnits"]
  }),
  withCzechCopy({
    id: "zen-garden",
    title: "Zenová Zahrádka — Rituální Hrablání",
    shortDescription: "Klid byl aplikován na povrch.",
    category: "care",
    status: "future",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "zen.rakeStroke",
      "zen.patternCompleted",
      "zen.stoneMoved",
      "zen.sandReset",
      "zen.harmonyThresholdReached"
    ],
    producedResourceKeys: ["proceduralCalm", "sandAlignment", "systemOrder"]
  }),
  withCzechCopy({
    id: "newton-cradle",
    title: "Newtonova Kolíbka — Přenos Odpovědnosti",
    shortDescription: "Hybnost byla předána. Odpovědnost nikoli.",
    category: "idle",
    status: "future",
    supportedSurfaces: ["standalone", "osWindow", "web"],
    emittedEventTypes: [
      "cradle.pull",
      "cradle.release",
      "cradle.impact",
      "cradle.cycleCompleted",
      "cradle.motionEnded",
      "cradle.responsibilityTransferred"
    ],
    producedResourceKeys: ["momentum", "transferredResponsibility", "idleFaith", "perceivedProductivity"]
  })
] as const satisfies readonly KorpModuleManifest[];

export const getModuleById = (id: string): KorpModuleManifest | undefined =>
  defaultModuleRegistry.find((module) => module.id === id);

export const listModules = (): readonly KorpModuleManifest[] => [...defaultModuleRegistry];

export const listModulesByStatus = (
  status: KorpModuleStatus
): readonly KorpModuleManifest[] => defaultModuleRegistry.filter((module) => module.status === status);

export const listModulesBySurface = (
  surface: KorpModuleSurface
): readonly KorpModuleManifest[] =>
  defaultModuleRegistry.filter((module) => module.supportedSurfaces.includes(surface));

export const listModulesByCategory = (
  category: KorpModuleCategory
): readonly KorpModuleManifest[] =>
  defaultModuleRegistry.filter((module) => module.category === category);
