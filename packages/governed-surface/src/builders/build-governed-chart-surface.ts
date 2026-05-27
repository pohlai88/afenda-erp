import { resolveGovernedChartPresentation } from "../resolvers/resolve-governed-presentation";
import type {
  ChartDataNature,
  GovernedChartConfigurationInput,
  GovernedChartKind,
} from "../schemas/chart.schema";
import type { ChartPresentationProfileId } from "../schemas/presentation-profile.schema";

export type BuildGovernedChartSurfaceInput = Omit<
  GovernedChartConfigurationInput,
  "chartKind" | "dataNature"
> & {
  presentationProfile: ChartPresentationProfileId;
  /** Override the profile default chartKind. */
  chartKind?: GovernedChartKind;
  /** Override the profile default dataNature. */
  dataNature?: ChartDataNature;
};

/**
 * Profile-first builder for chart surfaces (ARCH-007 §4.2).
 *
 * Selects `chartKind` and `dataNature` from the profile and merges with
 * caller-supplied series/heatmap/annotation data. Builders in domain/feature
 * packages call this rather than constructing `GovernedChartConfigurationInput`
 * directly, ensuring consistent presentation defaults across the ERP surface.
 */
export function buildGovernedChartSurface(
  input: BuildGovernedChartSurfaceInput,
): GovernedChartConfigurationInput {
  const { presentationProfile, chartKind, dataNature, ...rest } = input;
  const resolved = resolveGovernedChartPresentation({
    profile: presentationProfile,
    chartKind,
    dataNature,
  });
  return {
    ...rest,
    chartKind: resolved.chartKind,
    dataNature: resolved.dataNature,
  };
}
