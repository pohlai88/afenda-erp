import { GOVERNED_METADATA_SCHEMA_VERSION } from "../schemas/schema-version.shared";
import { resolveGovernedListPresentation } from "../resolvers/resolve-governed-presentation";
import type {
  ListSurfacePresentation,
  ListSurfaceRendererConfigurationInput,
  ListSurfaceRendererConfigurationResolvedInput,
} from "../schemas/list-surface-renderer.schema";
import type { ListPresentationProfileId } from "../schemas/presentation-profile.schema";

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
