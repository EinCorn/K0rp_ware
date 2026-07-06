import type { KorpState, KorpUnlockDefinition, KorpUnlockRequirement } from "./types";

export const defaultUnlockDefinitions: KorpUnlockDefinition[] = [
  {
    id: "button-compliance.module",
    title: "Button Compliance",
    requirement: { kind: "resourceAtLeast", resource: "auditPressure", amount: 200 }
  },
  {
    id: "corner-incident-001.memo",
    title: "Corner Incident 001",
    requirement: { kind: "resourceAtLeast", resource: "idleFaith", amount: 10 }
  },
  {
    id: "wellbeing-audit.memo",
    title: "Wellbeing Audit",
    requirement: {
      kind: "all",
      requirements: [
        { kind: "eventCountAtLeast", eventType: "clickaudit.click", count: 100 },
        { kind: "eventCountAtLeast", eventType: "bubble.sheetCompleted", count: 1 }
      ]
    }
  }
];

export const isRequirementMet = (state: KorpState, requirement: KorpUnlockRequirement): boolean => {
  if (requirement.kind === "resourceAtLeast") {
    return state.resources[requirement.resource] >= requirement.amount;
  }

  if (requirement.kind === "eventCountAtLeast") {
    return (state.stats.eventsByType[requirement.eventType] ?? 0) >= requirement.count;
  }

  return requirement.requirements.every((item) => isRequirementMet(state, item));
};

export const applyUnlocks = (
  state: KorpState,
  now: number,
  definitions: KorpUnlockDefinition[] = defaultUnlockDefinitions
): KorpState => {
  const unlockedIds = new Set(state.unlocks.unlockedIds);
  const unlockedAt = { ...state.unlocks.unlockedAt };

  for (const definition of definitions) {
    if (!unlockedIds.has(definition.id) && isRequirementMet(state, definition.requirement)) {
      unlockedIds.add(definition.id);
      unlockedAt[definition.id] = now;
    }
  }

  return {
    ...state,
    unlocks: {
      unlockedIds: [...unlockedIds],
      unlockedAt
    }
  };
};
