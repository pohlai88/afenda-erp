import { GOVERNED_METADATA_SCHEMA_VERSION } from "./gov-schema-version-shared";
import { resolveGovernedChartPresentation } from "../resolvers/resolve-governed-presentation";
import type {
  ChartDataNature,
  GovernedChartConfigurationInput,
  GovernedChartKind,
} from "./gov-chart-schema";
import type { ChartPresentationProfileId } from "./gov-presentation-profile-schema";

export type BuildGovernedChartSurfaceInput = Omit<
  GovernedChartConfigurationInput,
  "chartKind" | "dataNature" | "__schemaVersion"
> & {
  __schemaVersion?: GovernedChartConfigurationInput["__schemaVersion"];
  presentationProfile: ChartPresentationProfileId;
  chartKind?: GovernedChartKind;
  dataNature?: ChartDataNature;
};

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
