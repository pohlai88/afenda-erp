import { describe, expect, it } from "vitest";

import {
  diagnosticsDataAttributes,
  type GovernedDiagnostics,
} from "../../src/utils/governed-diagnostics.shared";

describe("governed diagnostics", () => {
  it("distinguishes invalid configuration from runtime error states", () => {
    expect(
      diagnosticsDataAttributes({ state: "invalid" })["data-render-state"],
    ).toBe("invalid");
    expect(
      diagnosticsDataAttributes({ state: "error" })["data-render-state"],
    ).toBe("error");
  });

  it("emits render state and test id only", () => {
    expect(
      diagnosticsDataAttributes({
        state: "ready",
        testId: "governed:list-surface:employee-table",
      }),
    ).toEqual({
      "data-render-state": "ready",
      "data-testid": "governed:list-surface:employee-table",
    });
  });

  it("omits undefined diagnostic attributes", () => {
    expect(diagnosticsDataAttributes({ state: "empty" })).toEqual({
      "data-render-state": "empty",
    });
    expect(diagnosticsDataAttributes(undefined)).toEqual({});
  });

  it("accepts GovernedDiagnostics without identity fields", () => {
    const diagnostics: GovernedDiagnostics = {
      state: "loading",
      testId: "governed:section-card:queue",
    };
    expect(diagnosticsDataAttributes(diagnostics)).toEqual({
      "data-render-state": "loading",
      "data-testid": "governed:section-card:queue",
    });
  });
});
