import { describe, expect, it } from "vitest";
import { createInitialState } from "../state";

it("creates a local-only Czech initial state for platform-independent core logic", () => {
  const state = createInitialState({ now: 1_700_000_000_000, employeeId: "employee-test-001" });

  expect(state).toMatchObject({
    version: "0.1.0",
    employeeId: "employee-test-001",
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    settings: {
      language: "cs-CZ",
      platform: "unknown",
      privacyMode: "localOnly"
    }
  });
  expect(state.resources.entropy).toBe(10);
  expect(state.modules["click-audit"].enabled).toBe(true);
});

describe("createInitialState options", () => {
  it("allows platform labels without embedding platform-specific behavior", () => {
    const state = createInitialState({ now: 10, settings: { platform: "windows" } });

    expect(state.settings.platform).toBe("windows");
    expect(state.settings.privacyMode).toBe("localOnly");
  });
});
