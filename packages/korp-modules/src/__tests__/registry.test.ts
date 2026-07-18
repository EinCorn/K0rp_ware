import { describe, expect, it } from "vitest";
import {
  defaultModuleRegistry,
  getModuleById,
  listModules,
  listModulesByCategory,
  listModulesByStatus,
  listModulesBySurface
} from "../index";

const expectedModuleIds = [
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

describe("default module registry", () => {
  it("contains every expected K0rp module", () => {
    expect(listModules().map((module) => module.id)).toEqual(expectedModuleIds);
  });

  it("uses unique module ids", () => {
    const ids = defaultModuleRegistry.map((module) => module.id);

    expect(new Set(ids)).toHaveLength(ids.length);
  });

  it("returns the matching manifest by id", () => {
    expect(getModuleById("bubble-wrap")).toMatchObject({
      id: "bubble-wrap",
      title: "Bublinková Fólie",
      status: "candidate"
    });
    expect(getModuleById("not-a-module")).toBeUndefined();
  });

  it("declares the canonical Fidget session closure event", () => {
    expect(getModuleById("fidget")?.emittedEventTypes).toContain("fidget.sessionSettled");
  });

  it("filters by status, surface, and category", () => {
    expect(listModulesByStatus("current").map((module) => module.id)).toEqual([
      "click-audit",
      "fidget",
      "bloom"
    ]);

    const overlayModules = listModulesBySurface("overlay");
    expect(overlayModules.map((module) => module.id)).toContain("corner-watch");
    expect(overlayModules.every((module) => module.supportedSurfaces.includes("overlay"))).toBe(true);

    expect(listModulesByCategory("audit").map((module) => module.id)).toEqual([
      "click-audit",
      "button-compliance"
    ]);
  });

  it("provides title, category, status, and supported surfaces for every manifest", () => {
    for (const module of defaultModuleRegistry) {
      expect(module.title.trim()).not.toBe("");
      expect(module.category).toBeTruthy();
      expect(module.status).toBeTruthy();
      expect(module.supportedSurfaces.length).toBeGreaterThan(0);
      expect(module.copy).toMatchObject({
        locale: "cs-CZ",
        title: module.title,
        shortDescription: module.shortDescription
      });
    }
  });
});
