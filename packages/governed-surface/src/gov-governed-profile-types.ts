import type { ListSurfacePresentation } from "../schemas/list-surface-renderer.schema";
import type { StatCardDensity } from "../schemas/stat-card.schema";
import type {
  ChartPresentationProfileId,
  ListPresentationProfileId,
  StatPresentationProfileId,
} from "../schemas/presentation-profile.schema";
import type { ChartDataNature, GovernedChartKind } from "./gov-chart-schema";

export type GovernedListPresentationProfileDefaults = ListSurfacePresentation;

export type GovernedStatPresentationProfileDefaults = {
  density: StatCardDensity;
};

export type GovernedChartPresentationProfileDefaults = {
  chartKind: GovernedChartKind;
  dataNature: ChartDataNature;
};

export type GovernedListPresentationProfiles = Readonly<
  Record<ListPresentationProfileId, GovernedListPresentationProfileDefaults>
>;

export type GovernedStatPresentationProfiles = Readonly<
  Record<StatPresentationProfileId, GovernedStatPresentationProfileDefaults>
>;

export type GovernedChartPresentationProfiles = Readonly<
  Record<ChartPresentationProfileId, GovernedChartPresentationProfileDefaults>
>;
