import { defaultKorpResources } from "./resources";
import type { KorpModuleId, KorpModuleState, KorpSettings, KorpState, KorpStats, KorpUnlockState } from "./types";

export const KORP_CORE_STATE_VERSION = "0.1.0";

const initialModuleIds: KorpModuleId[] = ["click-audit", "fidget", "bloom"];

const createModuleState = (): KorpModuleState => ({
  enabled: true,
  visible: true,
  localProgress: {}
});

const createInitialModules = (): Record<KorpModuleId, KorpModuleState> =>
  Object.fromEntries(initialModuleIds.map((id) => [id, createModuleState()])) as Record<KorpModuleId, KorpModuleState>;

const createInitialStats = (): KorpStats => ({
  totalEvents: 0,
  eventsByType: {},
  eventsByModule: {}
});

const createInitialUnlocks = (): KorpUnlockState => ({
  unlockedIds: [],
  unlockedAt: {}
});

const defaultSettings: KorpSettings = {
  language: "cs-CZ",
  platform: "unknown",
  privacyMode: "localOnly"
};

export type CreateInitialStateOptions = {
  now?: number;
  employeeId?: string;
  settings?: Partial<KorpSettings>;
};

export const createInitialState = (options: CreateInitialStateOptions = {}): KorpState => {
  const now = options.now ?? Date.now();

  return {
    version: KORP_CORE_STATE_VERSION,
    employeeId: options.employeeId ?? "employee-local-000",
    createdAt: now,
    updatedAt: now,
    resources: defaultKorpResources(),
    stats: createInitialStats(),
    unlocks: createInitialUnlocks(),
    modules: createInitialModules(),
    settings: { ...defaultSettings, ...options.settings }
  };
};
