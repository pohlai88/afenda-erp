import { describe, expect, it } from "vitest";
import { coreModuleIds, isModuleId, moduleIds } from "@afenda/config/module-ids";

describe("module id catalog", () => {
  it("keeps core modules inside the published catalog", () => {
    for (const moduleId of coreModuleIds) {
      expect(isModuleId(moduleId)).toBe(true);
    }
  });

  it("exposes a stable module id count for workspace routing", () => {
    expect(moduleIds.length).toBeGreaterThan(0);
  });
});
