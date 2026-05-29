import { moduleIds } from "@afenda/config/module-ids";
import { describe, expect, it } from "vitest";
import { getModuleObservabilityIndicators } from "../../src/module-indicators";

describe("module observability metadata", () => {
  it("defines two indicators for every module id", () => {
    for (const moduleId of moduleIds) {
      const indicators = getModuleObservabilityIndicators(moduleId);

      expect(indicators).toHaveLength(2);
      expect(indicators.every((indicator) => indicator.label.length > 0)).toBe(
        true,
      );
      expect(indicators.every((indicator) => indicator.value.length > 0)).toBe(
        true,
      );
      expect(indicators.every((indicator) => indicator.detail.length > 0)).toBe(
        true,
      );
    }
  });

  it("uses supported tone values for finance indicators", () => {
    const indicators = getModuleObservabilityIndicators("finance");

    expect(indicators.map((indicator) => indicator.tone)).toEqual([
      "positive",
      "positive",
    ]);
  });
});
