import type { ReactNode } from "react";

import { GovernedEmpty } from "../../client";
import {
  parseGovernedComponentData,
  type GovernedComponent,
} from "../../schemas/component.schema";
import { parseGovernedStackConfiguration } from "../../schemas/stack.schema";
import {
  densityGapClass,
  elevatedChromeFrameClass,
} from "../../schemas/surface-chrome.classes";
import { cn } from "@afenda/ui/utils";

import { GovernedComponentTree } from "../governed-component-tree";
import type { GovernedComponentRendererDiagnostics } from "../registry";

function renderChildren(
  children: unknown[],
  diagnostics: GovernedComponentRendererDiagnostics,
): ReactNode {
  return children.map((child, index) => {
    const parsed = parseGovernedComponentData(child);
    if (!parsed.success) {
      return null;
    }
    return (
      <GovernedComponentTree
        key={`${parsed.data.type}-${index}`}
        component={parsed.data as GovernedComponent}
        diagnostics={diagnostics}
      />
    );
  });
}

/**
 * governed:stack — flex layout for nested governed children.
 */
export function StackRenderer({
  configuration,
  diagnostics = "user",
}: {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
}) {
  const parsed = parseGovernedStackConfiguration(configuration);

  if (!parsed.success) {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: "Section unavailable",
          description:
            diagnostics === "operator"
              ? "The stack configuration failed validation."
              : "This section could not be loaded safely.",
        }}
      />
    );
  }

  const { direction, children, chrome, bentoTemplate } = parsed.data;

  const bentoClass =
    direction === "bento"
      ? bentoTemplate === "chart-sidebar-table"
        ? "grid gap-surface-lg @lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] @lg:grid-rows-[auto_1fr]"
        : "grid gap-surface-lg @sm:grid-cols-2 @xl:grid-cols-4"
      : undefined;

  return (
    <div
      className={cn(
        direction === "bento" && "@container",
        "flex",
        direction === "horizontal"
          ? "flex-row flex-wrap"
          : direction === "bento"
            ? "grid"
            : "flex-col",
        bentoClass,
        direction !== "bento" && densityGapClass(chrome?.density),
        direction === "bento" && "gap-surface-lg",
        elevatedChromeFrameClass(chrome?.elevation, chrome?.surface),
      )}
    >
      {renderChildren(children, diagnostics)}
    </div>
  );
}
