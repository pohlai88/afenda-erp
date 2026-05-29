import { GovernedSection } from "../../components/governed-section";
import { GovernedEmpty } from "../../client";
import { parseGovernedSectionConfiguration } from "../../schemas/section.schema";
import {
  densityGapClass,
  elevatedChromeFrameClass,
} from "../../schemas/surface-chrome.classes";
import { governedSurfaceParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";
import { cn } from "@afenda/ui/utils";

import { renderGovernedChildTree } from "../render-governed-child-tree.shared";
import type { GovernedComponentRendererDiagnostics } from "../registry";

export type SectionRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
};

/**
 * governed:section — page header + nested governed children.
 */
export function SectionRenderer({
  configuration,
  diagnostics = "user",
}: SectionRendererProps) {
  const parsed = parseGovernedSectionConfiguration(configuration);

  if (!parsed.success) {
    const copy = governedSurfaceParseErrorCopy(
      diagnostics,
      "The section configuration failed validation.",
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

  const { header, children, chrome } = parsed.data;
  const gapClass = densityGapClass(chrome?.density);

  if (!header?.title) {
    return (
      <div
        className={cn(
          "flex flex-col",
          gapClass,
          elevatedChromeFrameClass(chrome?.elevation, chrome?.surface),
        )}
      >
        {renderGovernedChildTree(children, diagnostics)}
      </div>
    );
  }

  return (
    <GovernedSection
      title={header.title}
      description={header.description}
      className={cn(
        "flex flex-col",
        gapClass,
        elevatedChromeFrameClass(chrome?.elevation, chrome?.surface),
      )}
    >
      {renderGovernedChildTree(children, diagnostics)}
    </GovernedSection>
  );
}
