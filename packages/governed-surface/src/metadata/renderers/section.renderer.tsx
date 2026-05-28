import { GovernedSection } from "../../components/governed-section";
import { GovernedEmpty } from "../../client";
import {
  parseGovernedComponentData,
  type GovernedComponent,
} from "../../schemas/component.schema";
import { parseGovernedSectionConfiguration } from "../../schemas/section.schema";
import {
  densityGapClass,
  elevatedChromeFrameClass,
} from "../../schemas/surface-chrome.classes";
import { cn } from "@afenda/ui/utils";

import { GovernedComponentTree } from "../governed-component-tree";
import type { GovernedComponentRendererDiagnostics } from "../registry";

export type SectionRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
};

function renderChildren(
  children: unknown[],
  diagnostics: GovernedComponentRendererDiagnostics,
): React.ReactNode {
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
 * governed:section — page header + nested governed children.
 */
export function SectionRenderer({
  configuration,
  diagnostics = "user",
}: SectionRendererProps) {
  const parsed = parseGovernedSectionConfiguration(configuration);

  if (!parsed.success) {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: "Section unavailable",
          description:
            diagnostics === "operator"
              ? "The section configuration failed validation."
              : "This section could not be loaded safely.",
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
        {renderChildren(children, diagnostics)}
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
      {renderChildren(children, diagnostics)}
    </GovernedSection>
  );
}
