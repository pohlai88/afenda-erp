import type { GovernedRenderableState } from "../schemas/governed-component-state.schema";

export type { GovernedRenderableState } from "../schemas/governed-component-state.schema";

export type GovernedDiagnostics = {
  state?: GovernedRenderableState;
  testId?: string;
};

export type GovernedDiagnosticsDataAttributes = {
  "data-render-state"?: GovernedRenderableState;
  "data-testid"?: string;
};

export function diagnosticsDataAttributes(
  diagnostics?: GovernedDiagnostics,
): GovernedDiagnosticsDataAttributes {
  if (!diagnostics) {
    return {};
  }

  const attrs: GovernedDiagnosticsDataAttributes = {};

  if (diagnostics.state) {
    attrs["data-render-state"] = diagnostics.state;
  }
  if (diagnostics.testId) {
    attrs["data-testid"] = diagnostics.testId;
  }

  return attrs;
}
