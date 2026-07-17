export { applyKorpEvent } from "./reducer";
export {
  allocateEvidence,
  canAllocateEvidence,
  clampMinimum,
  defaultKorpResources
} from "./resources";
export { KORP_CORE_STATE_VERSION, createInitialState } from "./state";
export { applyUnlocks, defaultUnlockDefinitions, isRequirementMet } from "./unlocks";
export type {
  CreateInitialStateOptions
} from "./state";
export type {
  KorpEvent,
  KorpEventType,
  KorpModuleId,
  KorpModuleState,
  KorpResourceId,
  KorpResources,
  KorpSettings,
  KorpState,
  KorpStats,
  KorpUnlockDefinition,
  KorpUnlockRequirement,
  KorpUnlockState
} from "./types";
