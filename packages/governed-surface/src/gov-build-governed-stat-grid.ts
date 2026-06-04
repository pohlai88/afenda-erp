import { GOVERNED_METADATA_SCHEMA_VERSION } from "./gov-schema-version-shared";
import { resolveGovernedStatPresentation } from "./gov-resolve-governed-presentation";
import type {
  StatCardConfigurationInput,
  StatCardConfigurationResolvedInput,
  StatCardDensity,
} from "./gov-stat-card-schema";
import type { StatPresentationProfileId } from "./gov-presentation-profile-schema";

export type BuildGovernedStatGridInput = Omit<
  StatCardConfigurationInput,
  "density" | "presentationProfile"
> & {
  presentationProfile: StatPresentationProfileId;
  density?: StatCardDensity;
};

export function buildGovernedStatGrid(
  input: BuildGovernedStatGridInput,
): StatCardConfigurationResolvedInput {
  const { presentationProfile, density, ...rest } = input;
  return {
    __schemaVersion: rest.__schemaVersion ?? GOVERNED_METADATA_SCHEMA_VERSION,
    ...rest,
    density: resolveGovernedStatPresentation({
      profile: presentationProfile,
      density,
    }),
  };
}
