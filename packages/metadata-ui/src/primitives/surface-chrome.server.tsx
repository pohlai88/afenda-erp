import "server-only";

import type { ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveBadge } from "./badge.server";
import { MetadataUiPrimitiveDescriptionList } from "./description-list.server";
import {
  parseMetadataUiSurfaceChrome,
  type MetadataUiSurfaceChromeInput,
  type MetadataUiSurfaceRegion,
  type MetadataUiSurfaceSectionRef,
} from "../schemas/surface-chrome.schema";

export type MetadataUiPrimitiveSurfaceChromeProps = Readonly<{
  surfaceChrome: MetadataUiSurfaceChromeInput;
  children?: ReactNode;
  className?: string;
  summaryClassName?: string;
  regionsClassName?: string;
  regionClassName?: string;
}>;

const SURFACE_REGION_LABEL = {
  header: "Header",
  toolbar: "Toolbar",
  summary: "Summary",
  primary: "Primary",
  secondary: "Secondary",
  aside: "Aside",
  footer: "Footer",
} as const satisfies Record<MetadataUiSurfaceRegion, string>;

const REGION_ORDER: readonly MetadataUiSurfaceRegion[] = [
  "header",
  "toolbar",
  "summary",
  "primary",
  "secondary",
  "aside",
  "footer",
];

function groupMetadataUiSurfaceSectionsByRegion(
  sections: readonly MetadataUiSurfaceSectionRef[],
): Record<MetadataUiSurfaceRegion, MetadataUiSurfaceSectionRef[]> {
  const grouped: Record<MetadataUiSurfaceRegion, MetadataUiSurfaceSectionRef[]> = {
    header: [],
    toolbar: [],
    summary: [],
    primary: [],
    secondary: [],
    aside: [],
    footer: [],
  };

  for (const section of sections) {
    grouped[section.region].push(section);
  }

  return grouped;
}

export function MetadataUiPrimitiveSurfaceChrome({
  surfaceChrome,
  children,
  className,
  summaryClassName,
  regionsClassName,
  regionClassName,
}: MetadataUiPrimitiveSurfaceChromeProps) {
  const resolvedSurfaceChrome = parseMetadataUiSurfaceChrome(surfaceChrome);
  const groupedSections = groupMetadataUiSurfaceSectionsByRegion(
    resolvedSurfaceChrome.sections,
  );
  const regionCount = REGION_ORDER.filter(
    (region) => groupedSections[region].length > 0,
  ).length;
  const summaryId = `${resolvedSurfaceChrome.key}-surface-chrome-summary`;

  return (
    <section
      className={cn("metadata-ui-surface-chrome grid", ui.surfaceGap.md, className)}
      role="region"
      aria-label={resolvedSurfaceChrome.title ?? "Surface chrome"}
      aria-describedby={summaryId}
      data-metadata-ui-surface-chrome={resolvedSurfaceChrome.key}
      data-metadata-ui-surface-variant={resolvedSurfaceChrome.variant}
      data-metadata-ui-surface-density={resolvedSurfaceChrome.density}
      data-metadata-ui-surface-section-count={resolvedSurfaceChrome.sections.length}
      data-metadata-ui-surface-region-count={regionCount}
    >
      <MetadataUiPrimitiveDescriptionList
        id={summaryId}
        className={summaryClassName}
        title={resolvedSurfaceChrome.title}
        description={resolvedSurfaceChrome.description}
        columns={3}
        items={[
          {
            key: "variant",
            label: "Variant",
            value: resolvedSurfaceChrome.variant,
          },
          {
            key: "density",
            label: "Density",
            value: resolvedSurfaceChrome.density,
          },
          {
            key: "sections",
            label: "Sections",
            value: resolvedSurfaceChrome.sections.length,
          },
          {
            key: "regions",
            label: "Regions",
            value: regionCount,
          },
          {
            key: "presentation",
            label: "Presentation",
            value: resolvedSurfaceChrome.presentation ? "Configured" : "Default",
          },
          {
            key: "permission",
            label: "Permission",
            value: resolvedSurfaceChrome.permission ? "Scoped" : "Open",
          },
        ]}
      />
      <div
        className={cn("grid gap-surface-sm", regionsClassName)}
        data-metadata-ui-surface-regions="true"
      >
        {REGION_ORDER.map((region) =>
          groupedSections[region].length > 0 ? (
            <section
              key={region}
              className={cn("grid gap-surface-xs rounded-section border border-border/60 bg-card p-surface-sm", regionClassName)}
              aria-label={`${SURFACE_REGION_LABEL[region]} region`}
              data-metadata-ui-surface-region={region}
            >
              <div className="flex flex-wrap items-center justify-between gap-surface-xs">
                <h3 className={cn(ui.typography.label, ui.color.ink.foreground)}>
                  {SURFACE_REGION_LABEL[region]}
                </h3>
                <MetadataUiPrimitiveBadge tone="neutral">
                  {groupedSections[region].length}
                </MetadataUiPrimitiveBadge>
              </div>
              <div className="flex flex-wrap gap-surface-xs">
                {groupedSections[region].map((sectionRef) => (
                  <MetadataUiPrimitiveBadge
                    key={`${region}:${sectionRef.sectionKey}`}
                    tone={sectionRef.lazy ? "muted" : "info"}
                    title={sectionRef.sectionKey}
                  >
                    {sectionRef.sectionKey}
                  </MetadataUiPrimitiveBadge>
                ))}
              </div>
            </section>
          ) : null,
        )}
      </div>
      {children ? <div className="grid gap-surface-sm">{children}</div> : null}
    </section>
  );
}

export default MetadataUiPrimitiveSurfaceChrome;
