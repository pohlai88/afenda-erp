import { GovernedEmpty } from "./gov-governed-empty";
import { parseGovernedStackConfiguration } from "./gov-stack-schema";
import {
  densityGapClass,
  elevatedChromeFrameClass,
} from "./gov-surface-chrome-classes";
import { governedSurfaceParseErrorCopy } from "./gov-governed-renderer-copy-shared";
import { cn } from "@afenda/ui/utils";

import { renderGovernedChildTree } from "./gov-render-governed-child-tree-shared";
import type { RendererProps } from "./gov-governed-renderer-dispatch";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";

/**
 * governed:stack — flex layout for nested governed children.
 */
export function StackRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: RendererProps) {
  const resolvedComponentKey = componentKey ?? sectionKey ?? surfaceKey ?? "stack";
  const parsed = parseGovernedStackConfiguration(configuration);

  if (!parsed.success) {
    const copy = governedSurfaceParseErrorCopy(
      diagnostics,
      "The stack configuration failed validation.",
    );
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
        }}
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={resolvedComponentKey}
        renderState="invalid"
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
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("stack", resolvedComponentKey),
        componentType: "governed:stack",
      })}
    >
      {renderGovernedChildTree(children, diagnostics, {
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
    </div>
  );
}
