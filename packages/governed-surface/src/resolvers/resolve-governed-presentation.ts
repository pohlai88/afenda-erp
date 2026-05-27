import {
  GOVERNED_CHART_PRESENTATION_PROFILES,
  GOVERNED_LIST_PRESENTATION_PROFILES,
  GOVERNED_STAT_PRESENTATION_PROFILES,
} from "../profiles/governed-presentation-profiles";
import type { ListSurfacePresentation } from "../schemas/list-surface-renderer.schema";
import type { StatCardDensity } from "../schemas/stat-card.schema";
import type { ChartDataNature, GovernedChartKind } from "../schemas/chart.schema";
import type { ListSurfaceToolbar } from "../schemas/list-surface-toolbar.schema";
import type {
  ChartPresentationProfileId,
  ListPresentationProfileId,
  StatPresentationProfileId,
} from "../schemas/presentation-profile.schema";

function mergeListSurfaceToolbar(
  base: ListSurfaceToolbar | undefined,
  override: ListSurfaceToolbar | undefined,
): ListSurfaceToolbar | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  return {
    ...base,
    ...override,
    export: override.export ?? base.export,
    search: override.search ?? base.search,
    filters: override.filters ?? base.filters,
    sort: override.sort ?? base.sort,
    savedView: override.savedView ?? base.savedView,
    bulkActions: override.bulkActions ?? base.bulkActions,
    densityToggle: override.densityToggle ?? base.densityToggle,
    columnPicker: override.columnPicker ?? base.columnPicker,
    resetParams: override.resetParams ?? base.resetParams,
  };
}

function mergeListSurfacePresentation(
  base: ListSurfacePresentation,
  override?: Partial<ListSurfacePresentation>,
): ListSurfacePresentation {
  if (!override) return base;
  return {
    variant: override.variant ?? base.variant,
    tableDensity: override.tableDensity ?? base.tableDensity,
    narrowMode: override.narrowMode ?? base.narrowMode,
    primaryColumnId: override.primaryColumnId ?? base.primaryColumnId,
    stickyHeader: override.stickyHeader ?? base.stickyHeader,
    virtualizeRowThreshold:
      override.virtualizeRowThreshold ?? base.virtualizeRowThreshold,
    toolbar: mergeListSurfaceToolbar(base.toolbar, override.toolbar),
    selection: override.selection ?? base.selection,
    grouping: override.grouping ?? base.grouping,
    summary: override.summary ?? base.summary,
    columnState: override.columnState ?? base.columnState,
    decisionLedger: override.decisionLedger ?? base.decisionLedger,
  };
}

export type ResolveGovernedListPresentationInput = {
  profile: ListPresentationProfileId;
  presentation?: Partial<ListSurfacePresentation>;
};

/**
 * Pure merge: profile defaults + builder `presentation` override.
 * No RBAC — runtime/builder omits export/trailing actions before calling.
 */
export function resolveGovernedListPresentation({
  profile,
  presentation,
}: ResolveGovernedListPresentationInput): ListSurfacePresentation {
  const defaults = GOVERNED_LIST_PRESENTATION_PROFILES[profile];
  return mergeListSurfacePresentation(defaults, presentation);
}

export type ResolveGovernedStatPresentationInput = {
  profile: StatPresentationProfileId;
  density?: StatCardDensity;
};

export function resolveGovernedStatPresentation({
  profile,
  density,
}: ResolveGovernedStatPresentationInput): StatCardDensity {
  const defaults = GOVERNED_STAT_PRESENTATION_PROFILES[profile];
  return density ?? defaults.density;
}

export type ResolveGovernedChartPresentationInput = {
  profile: ChartPresentationProfileId;
  chartKind?: GovernedChartKind;
  dataNature?: ChartDataNature;
};

export type GovernedChartPresentationResolved = {
  chartKind: GovernedChartKind;
  dataNature: ChartDataNature;
};

export function resolveGovernedChartPresentation({
  profile,
  chartKind,
  dataNature,
}: ResolveGovernedChartPresentationInput): GovernedChartPresentationResolved {
  const defaults = GOVERNED_CHART_PRESENTATION_PROFILES[profile];
  return {
    chartKind: chartKind ?? defaults.chartKind,
    dataNature: dataNature ?? defaults.dataNature,
  };
}
