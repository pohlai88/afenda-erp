import {
  parseMetadataUiPresentationContract,
  type MetadataUiPresentationContract,
  type MetadataUiPresentationContractInput,
  type MetadataUiPresentationLayout,
  type MetadataUiPresentationSurface,
} from "../contracts/presentation.contract";

export const METADATA_UI_PRESENTATION_PROFILE_IDS = {
  default: "metadata-ui.presentation.default",
  embedded: "metadata-ui.presentation.embedded",
  denseTable: "metadata-ui.presentation.dense-table",
  metric: "metadata-ui.presentation.metric",
  dialog: "metadata-ui.presentation.dialog",
} as const;

export type MetadataUiCanonicalPresentationProfileId =
  (typeof METADATA_UI_PRESENTATION_PROFILE_IDS)[keyof typeof METADATA_UI_PRESENTATION_PROFILE_IDS];

export type MetadataUiPresentationProfile<
  Id extends string = MetadataUiCanonicalPresentationProfileId,
> = Readonly<{
  id: Id;
  presentation: MetadataUiPresentationContract;
  surface: MetadataUiPresentationSurface;
  layout: MetadataUiPresentationLayout;
  description: string;
}>;

const METADATA_UI_PRESENTATION_PROFILE_INPUTS = {
  default: {
    profileId: METADATA_UI_PRESENTATION_PROFILE_IDS.default,
    chrome: {
      surface: "section",
      density: "comfortable",
      emphasis: "medium",
      tone: "neutral",
    },
    layout: {
      layout: "stack",
      alignment: "start",
      width: "full",
    },
    visibility: {
      showHeader: true,
      showDescription: true,
      showChrome: true,
      showDivider: false,
    },
    responsive: {
      priority: 50,
    },
    metadata: {
      role: "default-section",
    },
  },
  embedded: {
    profileId: METADATA_UI_PRESENTATION_PROFILE_IDS.embedded,
    chrome: {
      surface: "embedded",
      density: "compact",
      emphasis: "low",
      tone: "neutral",
    },
    layout: {
      layout: "stack",
      alignment: "start",
      width: "full",
    },
    visibility: {
      showHeader: true,
      showDescription: true,
      showChrome: false,
      showDivider: false,
    },
    responsive: {
      priority: 40,
    },
    metadata: {
      role: "embedded-section",
    },
  },
  denseTable: {
    profileId: METADATA_UI_PRESENTATION_PROFILE_IDS.denseTable,
    chrome: {
      surface: "card",
      density: "compact",
      emphasis: "medium",
      tone: "neutral",
    },
    layout: {
      layout: "table",
      alignment: "start",
      width: "full",
    },
    visibility: {
      showHeader: true,
      showDescription: false,
      showChrome: true,
      showDivider: true,
    },
    responsive: {
      collapseBelow: "md",
      priority: 70,
    },
    metadata: {
      role: "dense-data-section",
    },
  },
  metric: {
    profileId: METADATA_UI_PRESENTATION_PROFILE_IDS.metric,
    chrome: {
      surface: "card",
      density: "comfortable",
      emphasis: "high",
      tone: "neutral",
    },
    layout: {
      layout: "grid",
      alignment: "between",
      width: "full",
    },
    visibility: {
      showHeader: true,
      showDescription: false,
      showChrome: true,
      showDivider: false,
    },
    responsive: {
      collapseBelow: "sm",
      priority: 80,
    },
    metadata: {
      role: "metric-section",
    },
  },
  dialog: {
    profileId: METADATA_UI_PRESENTATION_PROFILE_IDS.dialog,
    chrome: {
      surface: "panel",
      density: "comfortable",
      emphasis: "medium",
      tone: "neutral",
    },
    layout: {
      layout: "stack",
      alignment: "start",
      width: "narrow",
    },
    visibility: {
      showHeader: true,
      showDescription: true,
      showChrome: true,
      showDivider: true,
    },
    responsive: {
      priority: 60,
    },
    metadata: {
      role: "dialog-section",
    },
  },
} as const satisfies Record<string, MetadataUiPresentationContractInput>;

function createMetadataUiPresentationProfile<
  const Id extends MetadataUiCanonicalPresentationProfileId,
>(
  input: MetadataUiPresentationContractInput & { profileId: Id },
  description: string,
): MetadataUiPresentationProfile<Id> {
  const presentation = parseMetadataUiPresentationContract(input);

  return {
    id: input.profileId,
    presentation,
    surface: presentation.chrome.surface,
    layout: presentation.layout.layout,
    description,
  };
}

export const METADATA_UI_PRESENTATION_PROFILES = {
  default: createMetadataUiPresentationProfile(
    METADATA_UI_PRESENTATION_PROFILE_INPUTS.default,
    "Default section presentation for governed metadata UI surfaces.",
  ),
  embedded: createMetadataUiPresentationProfile(
    METADATA_UI_PRESENTATION_PROFILE_INPUTS.embedded,
    "Chrome-free presentation for composition inside an existing container.",
  ),
  denseTable: createMetadataUiPresentationProfile(
    METADATA_UI_PRESENTATION_PROFILE_INPUTS.denseTable,
    "Compact tabular presentation for high-density governed lists.",
  ),
  metric: createMetadataUiPresentationProfile(
    METADATA_UI_PRESENTATION_PROFILE_INPUTS.metric,
    "Metric presentation for summary and stat sections.",
  ),
  dialog: createMetadataUiPresentationProfile(
    METADATA_UI_PRESENTATION_PROFILE_INPUTS.dialog,
    "Constrained panel presentation for modal and focused workflows.",
  ),
} as const;

export type MetadataUiPresentationProfileKey =
  keyof typeof METADATA_UI_PRESENTATION_PROFILES;

export type MetadataUiPresentationProfileRegistry =
  typeof METADATA_UI_PRESENTATION_PROFILES;

export type MetadataUiPresentationProfileByKey<
  Key extends MetadataUiPresentationProfileKey,
> = MetadataUiPresentationProfileRegistry[Key];

const METADATA_UI_PRESENTATION_PROFILES_BY_ID = Object.fromEntries(
  Object.values(METADATA_UI_PRESENTATION_PROFILES).map((profile) => [
    profile.id,
    profile,
  ]),
) as Readonly<Record<string, MetadataUiPresentationProfile>>;

export function listMetadataUiPresentationProfiles(): readonly MetadataUiPresentationProfile[] {
  return Object.values(METADATA_UI_PRESENTATION_PROFILES);
}

export function getMetadataUiPresentationProfile(
  profileId: string | undefined,
): MetadataUiPresentationProfile | undefined {
  if (!profileId) {
    return undefined;
  }

  return METADATA_UI_PRESENTATION_PROFILES_BY_ID[profileId];
}

export function hasMetadataUiPresentationProfile(
  profileId: string | undefined,
): profileId is MetadataUiCanonicalPresentationProfileId {
  return Boolean(getMetadataUiPresentationProfile(profileId));
}
