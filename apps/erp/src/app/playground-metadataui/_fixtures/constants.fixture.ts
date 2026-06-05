export const METADATA_UI_PLAYGROUND_ROUTE = "/playground-metadataui" as const;

export const METADATA_UI_PLAYGROUND_FIXED_INSTANT =
  "2026-01-01T08:00:00.000Z" as const;

export const METADATA_UI_PLAYGROUND_FIXTURE_IDS = {
  stack: "metadata-ui.playground.stack",
  pageHeaderSection: "metadata-ui.playground.page-header",
  pageHeaderMetadata: "metadata-ui.playground.header",
} as const;

export const METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS = {
  baseline: METADATA_UI_PLAYGROUND_FIXED_INSTANT,
  reviewWindowStart: "2026-01-01T09:00:00.000Z",
  reviewWindowEnd: "2026-01-01T17:00:00.000Z",
} as const;
