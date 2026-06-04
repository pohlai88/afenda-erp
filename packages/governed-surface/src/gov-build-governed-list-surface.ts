import { GOVERNED_METADATA_SCHEMA_VERSION } from "./gov-schema-version-shared";
import { resolveGovernedListPresentation } from "./gov-resolve-governed-presentation";
import type {
  ListSurfacePresentation,
  ListSurfaceRendererConfigurationInput,
  ListSurfaceRendererConfigurationResolvedInput,
} from "./gov-list-surface-renderer-schema";
import type { ListPresentationProfileId } from "./gov-presentation-profile-schema";

export type BuildGovernedListSurfaceInput = Omit<
  ListSurfaceRendererConfigurationInput,
  "presentation" | "presentationProfile"
> & {
  presentationProfile: ListPresentationProfileId;
  /** Merged on top of profile defaults via `resolveGovernedListPresentation`. */
  presentation?: Partial<ListSurfacePresentation>;
};

/**
 * Resolves profile defaults into `presentation` before parse/render.
 * Feature builders keep domain columns/rows; profiles own repeated table chrome.
 */
export function buildGovernedListSurface(
  input: BuildGovernedListSurfaceInput,
): ListSurfaceRendererConfigurationResolvedInput {
  const { presentationProfile, presentation, ...rest } = input;
  return {
    __schemaVersion: rest.__schemaVersion ?? GOVERNED_METADATA_SCHEMA_VERSION,
    ...rest,
    presentation: resolveGovernedListPresentation({
      profile: presentationProfile,
      presentation,
    }),
  };
}
