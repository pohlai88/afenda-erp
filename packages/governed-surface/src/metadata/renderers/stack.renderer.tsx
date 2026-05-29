import { GovernedEmpty } from "../../client";
import { parseGovernedStackConfiguration } from "../../schemas/stack.schema";
import {
  densityGapClass,
  elevatedChromeFrameClass,
} from "../../schemas/surface-chrome.classes";
import { governedSurfaceParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";
import { cn } from "@afenda/ui/utils";

import { renderGovernedChildTree } from "../render-governed-child-tree.shared";
import type { GovernedComponentRendererDiagnostics } from "../registry";

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
      {renderGovernedChildTree(children, diagnostics)}
    </div>
  );
}
