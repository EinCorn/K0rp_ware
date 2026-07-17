import { clampMinimum } from "./resources";
import { applyUnlocks } from "./unlocks";
import type { KorpEvent, KorpResources, KorpState } from "./types";

const eventValue = (event: KorpEvent, fallback = 1): number => event.value ?? fallback;

const updateResource = (
  resources: KorpResources,
  key: keyof KorpResources,
  delta: number,
  minimum?: number
): KorpResources => ({
  ...resources,
  [key]: minimum === undefined ? resources[key] + delta : clampMinimum(resources[key] + delta, minimum)
});

const applyResourceEffects = (resources: KorpResources, event: KorpEvent): KorpResources => {
  const value = eventValue(event);

  switch (event.type) {
    case "clickaudit.click":
    case "clickaudit.batchCompleted":
      return resources;
    case "audit.evidenceCertified":
      return updateResource(resources, "notionalWorkUnits", value, 0);
    case "fidget.spinTick":
      return {
        ...resources,
        stabilization: resources.stabilization + value * 0.25,
        perceivedControl: resources.perceivedControl + value * 0.1,
        entropy: clampMinimum(resources.entropy - value * 0.05)
      };
    case "bloom.matchCleared":
      return {
        ...resources,
        complianceIntegrity: resources.complianceIntegrity + value,
        systemOrder: resources.systemOrder + value * 0.5,
        bloomIntegrity: resources.bloomIntegrity + value
      };
    case "corner.cornerHit":
      return updateResource(resources, "idleFaith", value * 50);
    case "corner.nearMiss":
      return updateResource(resources, "patienceUnits", value);
    case "bubble.popped":
      return {
        ...resources,
        reliefUnits: resources.reliefUnits + value,
        pressureReleased: resources.pressureReleased + value * 0.25,
        stabilization: resources.stabilization + value * 0.1,
        entropy: clampMinimum(resources.entropy - value * 0.05)
      };
    case "button.pressed":
    case "button.confirmationConfirmed":
      return {
        ...resources,
        approvalUnits: resources.approvalUnits + value,
        auditPressure: resources.auditPressure + value * 0.25,
        kryptoManagementScore: resources.kryptoManagementScore + value * 0.5
      };
    case "surface.dirtRemoved":
    case "surface.patchCleaned":
      return {
        ...resources,
        cleanliness: resources.cleanliness + value,
        complianceIntegrity: resources.complianceIntegrity + value * 0.5,
        systemOrder: resources.systemOrder + value * 0.25
      };
    case "shape.snapped":
      return {
        ...resources,
        alignment: resources.alignment + value,
        closure: resources.closure + value * 0.5,
        systemOrder: resources.systemOrder + value * 0.25
      };
    case "runner.obstacleAvoided":
      return {
        ...resources,
        attentionResidue: resources.attentionResidue + value,
        dopamineDrift: resources.dopamineDrift + value * 0.25,
        notionalWorkUnits: resources.notionalWorkUnits + value * 0.05
      };
    case "zen.patternCompleted":
      return {
        ...resources,
        proceduralCalm: resources.proceduralCalm + value,
        sandAlignment: resources.sandAlignment + value,
        systemOrder: resources.systemOrder + value * 0.5,
        entropy: clampMinimum(resources.entropy - value * 0.1)
      };
    case "cradle.responsibilityTransferred":
      return {
        ...resources,
        transferredResponsibility: resources.transferredResponsibility + value,
        perceivedProductivity: resources.perceivedProductivity + value * 0.5
      };
    case "cradle.impact":
      return updateResource(resources, "momentum", value);
    case "system.externalWorkPulse":
      return updateResource(resources, "notionalWorkUnits", value);
    default:
      return resources;
  }
};

const applyStats = (state: KorpState, event: KorpEvent): KorpState => ({
  ...state,
  updatedAt: event.timestamp,
  stats: {
    totalEvents: state.stats.totalEvents + 1,
    eventsByType: {
      ...state.stats.eventsByType,
      [event.type]: (state.stats.eventsByType[event.type] ?? 0) + 1
    },
    eventsByModule: {
      ...state.stats.eventsByModule,
      [event.sourceModule]: (state.stats.eventsByModule[event.sourceModule] ?? 0) + 1
    },
    lastEventAt: event.timestamp
  }
});

export const applyKorpEvent = (state: KorpState, event: KorpEvent): KorpState => {
  const nextState = applyStats(
    {
      ...state,
      resources: applyResourceEffects(state.resources, event)
    },
    event
  );

  return applyUnlocks(nextState, event.timestamp);
};
