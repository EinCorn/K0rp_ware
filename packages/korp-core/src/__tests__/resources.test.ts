import { describe, expect, it } from "vitest";
import { allocateEvidence, canAllocateEvidence, defaultKorpResources } from "../resources";

describe("Evidence allocation", () => {
  it("uses the same sufficient-balance guard exposed to runtime integrations", () => {
    const resources = defaultKorpResources();
    resources.notionalWorkUnits = 1;

    expect(canAllocateEvidence(resources, 1)).toBe(true);
    expect(canAllocateEvidence(resources, 2)).toBe(false);
    expect(canAllocateEvidence(resources, 0)).toBe(false);
    expect(canAllocateEvidence(resources, Number.NaN)).toBe(false);

    resources.notionalWorkUnits = Number.POSITIVE_INFINITY;
    expect(canAllocateEvidence(resources, 1)).toBe(false);
  });

  it("never mutates or overdraws resources when allocation cannot be fulfilled", () => {
    const resources = defaultKorpResources();
    const next = allocateEvidence(resources, 1);

    expect(next).toBe(resources);
    expect(next.notionalWorkUnits).toBe(0);
  });
});
