import type { ReactNode } from "react";

import { GovernedComponentTree } from "./governed-component-tree";
import type {
  AfendaGovernedComponentRegistry,
  GovernedComponentRendererDiagnostics,
  GovernedComponentRendererInput,
} from "./registry";

export type GovernedComponentRendererProps = {
  component: GovernedComponentRendererInput | unknown;
  registry?: AfendaGovernedComponentRegistry;
  diagnostics?: GovernedComponentRendererDiagnostics;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

/**
 * Public boundary for governed metadata rendering.
 *
 * Delegates dispatch + dataNature contract enforcement to
 * `GovernedComponentTree` so the diagnostic copy and ADR-0025 §3 pre-flight
 * apply uniformly across all entry points.
 */
export function GovernedComponentRenderer({
  component,
  registry,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: GovernedComponentRendererProps): ReactNode {
  return (
    <GovernedComponentTree
      component={component}
      registry={registry}
      diagnostics={diagnostics}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey}
    />
  );
}
