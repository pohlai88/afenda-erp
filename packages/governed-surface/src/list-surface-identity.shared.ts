import type { ListSurfaceRendererDataNature } from "./gov-list-surface-renderer-schema";
import type { ListSurfaceRowTrailingAction } from "./gov-list-surface-row-trailing-action-schema";
import {
  diagnosticsDataAttributes,
  type GovernedDiagnosticsDataAttributes,
} from "./utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
  type GovernedIdentityAttributes,
} from "./utils/governed-identity.shared";

export type GovernedListSurfaceRenderState = "empty" | "ready";

export type GovernedListSurfaceTrailingSummary = {
  total: number;
  hidden: number;
  disabled: number;
  ready: number;
};

export type GovernedListSurfaceRenderLogFields = {
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  columnsId: string;
  dataNature: ListSurfaceRendererDataNature;
  presentationVariant: string;
  density: string;
  state: GovernedListSurfaceRenderState;
  rowCount: number;
  trailing: GovernedListSurfaceTrailingSummary;
};

/** Stable per-request dedupe key for `logGovernedListSurfaceRender`. */
export function buildGovernedListSurfaceRenderFingerprint(
  input: GovernedListSurfaceRenderLogFields,
): string {
  return [
    input.surfaceKey,
    input.sectionKey ?? "",
    input.componentKey ?? "",
    input.state,
    input.rowCount,
    input.columnsId,
    input.density,
    input.presentationVariant,
    input.trailing.hidden,
    input.trailing.disabled,
    input.trailing.ready,
  ].join("|");
}

export function governedListSectionTestId(surfaceKey: string): string {
  return governedTestId("list-section", surfaceKey);
}

export function governedListSectionDomId(surfaceKey: string): string {
  return `governed-list-section-${surfaceKey.replace(/[^A-Za-z0-9_-]+/g, "-")}`;
}

export function governedListSectionAnchorHref(surfaceKey: string): string {
  return `#${governedListSectionDomId(surfaceKey)}`;
}

export function governedListSurfaceTestId(surfaceKey: string): string {
  return governedTestId("list-surface", surfaceKey);
}

export function governedListRowTestId(
  surfaceKey: string,
  rowId: string,
): string {
  return governedTestId("list-row", `${surfaceKey}:${rowId}`);
}

export function summarizeListSurfaceTrailingActions(
  rows: readonly { trailingAction?: ListSurfaceRowTrailingAction }[],
): GovernedListSurfaceTrailingSummary {
  const summary: GovernedListSurfaceTrailingSummary = {
    total: rows.length,
    hidden: 0,
    disabled: 0,
    ready: 0,
  };

  for (const row of rows) {
    const state = row.trailingAction?.state;
    if (state === "hidden") summary.hidden += 1;
    else if (state === "disabled") summary.disabled += 1;
    else if (state === "ready") summary.ready += 1;
  }

  return summary;
}

export type GovernedListSurfaceLegacyDataAttributes = {
  "data-governed-surface-key"?: string;
  "data-governed-list-state"?: GovernedListSurfaceRenderState;
  "data-governed-columns-id"?: string;
  "data-governed-table-density"?: string;
  "data-governed-data-nature"?: ListSurfaceRendererDataNature;
  "data-governed-presentation-variant"?: string;
};

/** Legacy `data-governed-*` attrs plus governed identity and diagnostics attrs. */
export type GovernedListSurfaceDataAttributes = GovernedListSurfaceLegacyDataAttributes &
  GovernedIdentityAttributes &
  GovernedDiagnosticsDataAttributes;

export function buildGovernedListSurfaceDataAttributes(input: {
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  columnsId?: string;
  dataNature?: ListSurfaceRendererDataNature;
  presentationVariant?: string;
  density?: string;
  state: GovernedListSurfaceRenderState;
}): GovernedListSurfaceDataAttributes {
  const legacy: GovernedListSurfaceLegacyDataAttributes = {
    ...(input.surfaceKey
      ? { "data-governed-surface-key": input.surfaceKey }
      : {}),
    "data-governed-list-state": input.state,
    ...(input.columnsId ? { "data-governed-columns-id": input.columnsId } : {}),
    ...(input.density ? { "data-governed-table-density": input.density } : {}),
    ...(input.dataNature
      ? { "data-governed-data-nature": input.dataNature }
      : {}),
    ...(input.presentationVariant
      ? { "data-governed-presentation-variant": input.presentationVariant }
      : {}),
  };

  const canonical = {
    ...governedIdentityAttributes({
      surfaceKey: input.surfaceKey,
      sectionKey: input.sectionKey ?? input.surfaceKey,
      componentKey: input.componentKey ?? input.sectionKey ?? input.surfaceKey,
    }),
    ...diagnosticsDataAttributes({
      state: input.state,
      testId: input.surfaceKey
        ? governedListSurfaceTestId(input.surfaceKey)
        : undefined,
    }),
  };

  return { ...legacy, ...canonical };
}
