export const METADATA_UI_PLAYGROUND_SAMPLE_COPY = {
  operatorName: "Sample Operator",
  operatorEmail: "sample.operator@example.invalid",
  accountSubtitle: "Fixture account",
  appTitle: "Metadata UI Playground",
  appEyebrow: "Developer preview",
  appDescription:
    "Metadata-driven fixture atlas for previewing governed renderers and shadcn primitives composed exclusively through @afenda/metadata-ui — no direct shadcn imports in this route.",
  overviewNavLabel: "Overview",
  overviewCommandLabel: "Open playground atlas",
  overviewCommandDescription:
    "Inspect the full static metadata UI playground surface.",
} as const;

export const METADATA_UI_PLAYGROUND_SAMPLE_LABELS = {
  sampleVendor: "Sample Vendor",
  sampleLocation: "Sample Location",
  sampleApproval: "Sample Approval",
  sampleRecord: "Sample Record",
  sampleOperator: "Sample Operator",
} as const;

export const METADATA_UI_PLAYGROUND_SCREENSHOT_SAFE_VALUES = [
  METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleVendor,
  METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation,
  METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleApproval,
  METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord,
  METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
] as const;
