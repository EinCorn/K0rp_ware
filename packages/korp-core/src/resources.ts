import type { KorpResources } from "./types";

export const defaultKorpResources = (): KorpResources => ({
  notionalWorkUnits: 0,
  auditPressure: 0,
  stabilization: 0,
  complianceIntegrity: 0,
  entropy: 10,
  perceivedProductivity: 0,
  systemOrder: 0,
  idleFaith: 0,
  reliefUnits: 0,
  approvalUnits: 0,
  cleanliness: 0,
  alignment: 0,
  attentionResidue: 0,
  proceduralCalm: 0,
  momentum: 0,
  transferredResponsibility: 0,
  perceivedControl: 0,
  bloomIntegrity: 0,
  patienceUnits: 0,
  pressureReleased: 0,
  kryptoManagementScore: 0,
  closure: 0,
  dopamineDrift: 0,
  sandAlignment: 0
});

export const clampMinimum = (value: number, minimum = 0): number => Math.max(minimum, value);

export const canAllocateEvidence = (resources: KorpResources, cost: number): boolean =>
  Number.isFinite(resources.notionalWorkUnits) &&
  Number.isFinite(cost) &&
  cost > 0 &&
  resources.notionalWorkUnits >= cost;

export const allocateEvidence = (resources: KorpResources, cost: number): KorpResources => {
  if (!canAllocateEvidence(resources, cost)) {
    return resources;
  }

  return {
    ...resources,
    notionalWorkUnits: resources.notionalWorkUnits - cost
  };
};
