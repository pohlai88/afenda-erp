import type { ReactNode } from "react";

import { GovernedEmpty } from "./gov-governed-empty";
import {
  parseGovernedComponentData,
  type GovernedComponent,
} from "./gov-component-schema";
import { governedSurfaceParseErrorCopy } from "./gov-governed-renderer-copy-shared";

import { GovernedComponentTree } from "./gov-governed-component-tree";
import type { GovernedComponentRendererDiagnostics } from "./gov-registry";

/** Renders nested governed children with enterprise-safe fallbacks for invalid nodes. */
export function renderGovernedChildTree(
  children: unknown[],
  diagnostics: GovernedComponentRendererDiagnostics,
  identity?: {
    surfaceKey?: string;
    sectionKey?: string;
    componentKey?: string;
  },
): ReactNode {
  return children.map((child, index) => {
    const parsed = parseGovernedComponentData(child);
    if (!parsed.success) {
      const copy = governedSurfaceParseErrorCopy(
        diagnostics,
        "A nested governed component failed validation.",
      );
      return (
        <GovernedEmpty
          key={`invalid-child-${index}`}
          className="p-4 @sm:p-6"
          model={{
            variant: "error",
            title: copy.title,
            description: copy.description,
          }}
        />
      );
    }
    return (
      <GovernedComponentTree
        key={`${parsed.data.type}-${index}`}
        component={parsed.data as GovernedComponent}
        diagnostics={diagnostics}
        surfaceKey={identity?.surfaceKey}
        sectionKey={identity?.sectionKey}
        componentKey={
          identity?.componentKey
            ? `${identity.componentKey}-${parsed.data.type}-${index}`
            : undefined
        }
      />
    );
  });
}
