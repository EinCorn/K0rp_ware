import { describe, expect, it } from "vitest";
import { applyKorpEvent } from "../reducer";
import { createInitialState } from "../state";
import type { KorpEvent } from "../types";

const event = (overrides: Partial<KorpEvent>): KorpEvent => ({
  id: "event-001",
  timestamp: 2_000,
  sourceModule: "system",
  type: "system.externalWorkPulse",
  ...overrides
});

describe("applyKorpEvent", () => {
  it("records ClickAudit clicks as raw stats without awarding Evidence", () => {
    const state = createInitialState({ now: 1_000 });
    const next = applyKorpEvent(
      state,
      event({ sourceModule: "click-audit", type: "clickaudit.click", value: 2 })
    );

    expect(next.resources.auditPressure).toBe(0);
    expect(next.resources.notionalWorkUnits).toBe(0);
    expect(next.resources.perceivedProductivity).toBe(0);
    expect(next.stats.totalEvents).toBe(1);
    expect(next.stats.eventsByType["clickaudit.click"]).toBe(1);
    expect(next.stats.eventsByModule["click-audit"]).toBe(1);
    expect(next.updatedAt).toBe(2_000);
  });

  it("awards spendable Evidence only through audit certification", () => {
    const state = createInitialState({ now: 1_000 });
    const next = applyKorpEvent(
      state,
      event({ type: "audit.evidenceCertified", value: 1 })
    );

    expect(next.resources.notionalWorkUnits).toBe(1);
    expect(next.stats.eventsByType["audit.evidenceCertified"]).toBe(1);
  });

  it("reduces entropy for bubble pops without going below zero", () => {
    const state = createInitialState({ now: 1_000 });
    const next = applyKorpEvent(
      state,
      event({ sourceModule: "bubble-wrap", type: "bubble.popped", value: 999 })
    );

    expect(next.resources.reliefUnits).toBe(999);
    expect(next.resources.pressureReleased).toBeCloseTo(249.75);
    expect(next.resources.entropy).toBe(0);
  });

  it("applies cross-module unlock skeleton rules", () => {
    let state = createInitialState({ now: 1_000 });

    for (let index = 0; index < 100; index += 1) {
      state = applyKorpEvent(
        state,
        event({ id: `click-${index}`, timestamp: 2_000 + index, sourceModule: "click-audit", type: "clickaudit.click" })
      );
    }

    const next = applyKorpEvent(
      state,
      event({ id: "sheet-001", timestamp: 3_000, sourceModule: "bubble-wrap", type: "bubble.sheetCompleted" })
    );

    expect(next.unlocks.unlockedIds).toContain("wellbeing-audit.memo");
    expect(next.unlocks.unlockedAt["wellbeing-audit.memo"]).toBe(3_000);
  });
});
