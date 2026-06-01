import { GOVERNED_METADATA_SCHEMA_VERSION } from "../schemas/schema-version.shared";
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
 * Profile-first builder for governed chart surfaces.
 *
 * Feature/domain packages pass business data and intent; presentation profile
 * owns the repeated ERP chart defaults.
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
    __schemaVersion: rest.__schemaVersion ?? GOVERNED_METADATA_SCHEMA_VERSION,
    ...rest,
    chartKind: resolved.chartKind,
    dataNature: resolved.dataNature,
  };
}
