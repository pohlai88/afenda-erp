import type { GovernedRenderableState } from "../schemas/governed-component-state.schema";

export type { GovernedRenderableState } from "../schemas/governed-component-state.schema";

export type GovernedDiagnosticState = GovernedRenderableState | "disabled";

export type GovernedDiagnostics = {
  state?: GovernedDiagnosticState;
  testId?: string;
  componentType?: string;
};

export type GovernedDiagnosticsDataAttributes = {
  "data-render-state"?: GovernedDiagnosticState;
  "data-testid"?: string;
  "data-component-type"?: string;
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
  if (diagnostics.componentType) {
    attrs["data-component-type"] = diagnostics.componentType;
  }

  return attrs;
}
