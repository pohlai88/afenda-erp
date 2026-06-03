import { GovernedSection } from "../../components/governed-section";
import { GovernedEmpty } from "./client";
import { parseGovernedSectionConfiguration } from "./gov-section-schema";
import {
  densityGapClass,
  elevatedChromeFrameClass,
} from "../../schemas/surface-chrome.classes";
import { governedSurfaceParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";
import { cn } from "@afenda/ui/utils";

import { renderGovernedChildTree } from "../render-governed-child-tree.shared";
import type { GovernedComponentRendererDiagnostics } from "./gov-registry";
import { diagnosticsDataAttributes } from "../../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "../../utils/governed-identity.shared";

export type SectionRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

/**
 * governed:section — page header + nested governed children.
 */
export function SectionRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
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
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={componentKey ?? sectionKey ?? surfaceKey}
        renderState="invalid"
      />
    );
  }

  const { header, children, chrome } = parsed.data;
  const resolvedSurfaceKey = surfaceKey ?? header?.title;
  const resolvedSectionKey = sectionKey ?? resolvedSurfaceKey ?? header?.title;
  const resolvedComponentKey = componentKey ?? resolvedSectionKey;
  const gapClass = densityGapClass(chrome?.density);

  if (!header?.title) {
    return (
      <div
        className={cn(
          "flex flex-col",
          gapClass,
          elevatedChromeFrameClass(chrome?.elevation, chrome?.surface),
        )}
        {...governedIdentityAttributes({
          surfaceKey: resolvedSurfaceKey,
          sectionKey: resolvedSectionKey,
          componentKey: resolvedComponentKey,
        })}
        {...diagnosticsDataAttributes({
          state: "ready",
          testId: governedTestId("section", resolvedComponentKey ?? "section"),
          componentType: "governed:section",
        })}
      >
        {renderGovernedChildTree(children, diagnostics, {
          surfaceKey: resolvedSurfaceKey,
          sectionKey: resolvedSectionKey,
          componentKey: resolvedComponentKey,
        })}
      </div>
    );
  }

  return (
    <GovernedSection
      title={header.title}
      description={header.description}
      surfaceKey={resolvedSurfaceKey ?? header.title}
      sectionKey={resolvedSectionKey ?? header.title}
      componentKey={resolvedComponentKey ?? header.title}
      className={cn(
        "flex flex-col",
        gapClass,
        elevatedChromeFrameClass(chrome?.elevation, chrome?.surface),
      )}
    >
      {renderGovernedChildTree(children, diagnostics, {
        surfaceKey: resolvedSurfaceKey,
        sectionKey: resolvedSectionKey,
        componentKey: resolvedComponentKey,
      })}
    </GovernedSection>
  );
}
