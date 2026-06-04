import {
  parseMetadataUiPresentationContract,
  type MetadataUiPresentationContract,
  type MetadataUiPresentationContractForLayout,
  type MetadataUiPresentationContractForSurface,
  type MetadataUiPresentationContractInput,
  type MetadataUiPresentationLayout,
  type MetadataUiPresentationSurface,
} from "../contracts/presentation.contract";
import {
  getMetadataUiPresentationProfile,
  METADATA_UI_PRESENTATION_PROFILES,
} from "./presentation-profiles.shared";

export type MetadataUiPresentationResolutionOptions = Readonly<{
  presentation?: MetadataUiPresentationContractInput | MetadataUiPresentationContract;
  profileId?: string;
  overrides?: MetadataUiPresentationContractInput;
}>;

export type MetadataUiPresentationResolutionInput =
  | MetadataUiPresentationContractInput
  | MetadataUiPresentationContract
  | MetadataUiPresentationResolutionOptions
  | undefined;

type MetadataUiPresentationMergeInput =
  | MetadataUiPresentationContractInput
  | MetadataUiPresentationContract
  | undefined;

function isMetadataUiPresentationResolutionOptions(
  input: MetadataUiPresentationResolutionInput,
): input is MetadataUiPresentationResolutionOptions {
  if (!input || typeof input !== "object") {
    return false;
  }

  return "presentation" in input || "overrides" in input;
}

function mergeMetadataUiRecord(
  base: Record<string, unknown> | undefined,
  override: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!base && !override) {
    return undefined;
  }

  return {
    ...(base ?? {}),
    ...(override ?? {}),
  };
}

export function mergeMetadataUiPresentationInputs(
  base: MetadataUiPresentationMergeInput,
  override: MetadataUiPresentationMergeInput,
): MetadataUiPresentationContractInput {
  return {
    ...base,
    ...override,
    chrome: {
      ...base?.chrome,
      ...override?.chrome,
    },
    layout: {
      ...base?.layout,
      ...override?.layout,
    },
    visibility: {
      ...base?.visibility,
      ...override?.visibility,
    },
    responsive: {
      ...base?.responsive,
      ...override?.responsive,
    },
    metadata: mergeMetadataUiRecord(base?.metadata, override?.metadata),
  };
}

export function resolveMetadataUiPresentation(
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiPresentationContract {
  const options = isMetadataUiPresentationResolutionOptions(input)
    ? input
    : undefined;
  const presentation = options ? options.presentation : input;
  const requestedProfileId = options?.profileId ?? presentation?.profileId;
  const requestedProfile = getMetadataUiPresentationProfile(requestedProfileId);
  const baseProfile =
    requestedProfile ?? METADATA_UI_PRESENTATION_PROFILES.default;
  const profileSelection =
    requestedProfileId && !requestedProfile
      ? ({ profileId: requestedProfileId } satisfies MetadataUiPresentationContractInput)
      : undefined;
  const withProfileId = mergeMetadataUiPresentationInputs(
    baseProfile.presentation,
    profileSelection,
  );
  const withPresentation = mergeMetadataUiPresentationInputs(
    withProfileId,
    presentation,
  );
  const withOverrides = mergeMetadataUiPresentationInputs(
    withPresentation,
    options?.overrides,
  );

  return parseMetadataUiPresentationContract(withOverrides);
}

export function resolveMetadataUiPresentationForSurface<
  Surface extends MetadataUiPresentationSurface,
>(
  surface: Surface,
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiPresentationContractForSurface<Surface> {
  return resolveMetadataUiPresentation({
    presentation: input && !isMetadataUiPresentationResolutionOptions(input)
      ? input
      : isMetadataUiPresentationResolutionOptions(input)
        ? input.presentation
        : undefined,
    profileId: isMetadataUiPresentationResolutionOptions(input)
      ? input.profileId
      : undefined,
    overrides: mergeMetadataUiPresentationInputs(
      isMetadataUiPresentationResolutionOptions(input) ? input.overrides : undefined,
      {
        chrome: {
          surface,
        },
      },
    ),
  }) as MetadataUiPresentationContractForSurface<Surface>;
}

export function resolveMetadataUiPresentationForLayout<
  Layout extends MetadataUiPresentationLayout,
>(
  layout: Layout,
  input?: MetadataUiPresentationResolutionInput,
): MetadataUiPresentationContractForLayout<Layout> {
  return resolveMetadataUiPresentation({
    presentation: input && !isMetadataUiPresentationResolutionOptions(input)
      ? input
      : isMetadataUiPresentationResolutionOptions(input)
        ? input.presentation
        : undefined,
    profileId: isMetadataUiPresentationResolutionOptions(input)
      ? input.profileId
      : undefined,
    overrides: mergeMetadataUiPresentationInputs(
      isMetadataUiPresentationResolutionOptions(input) ? input.overrides : undefined,
      {
        layout: {
          layout,
        },
      },
    ),
  }) as MetadataUiPresentationContractForLayout<Layout>;
}
