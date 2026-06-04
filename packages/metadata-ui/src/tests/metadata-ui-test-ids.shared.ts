import {
  createMetadataUiTestId,
  type MetadataUiTestIdPart,
} from "../identity/test-id.shared";

export const METADATA_UI_TEST_ID_PREFIX = "metadata-ui" as const;

export type MetadataUiTestSurface =
  | "action"
  | "client"
  | "component"
  | "fixture"
  | "renderer"
  | "section";

export type MetadataUiTestIdInput = Readonly<{
  surface: MetadataUiTestSurface;
  kind?: MetadataUiTestIdPart;
  key?: MetadataUiTestIdPart;
  slot?: MetadataUiTestIdPart;
}>;

export function createMetadataUiStableTestId(
  input: MetadataUiTestIdInput,
): string {
  return createMetadataUiTestId(
    METADATA_UI_TEST_ID_PREFIX,
    input.surface,
    input.kind,
    input.key,
    input.slot,
  );
}

export function createMetadataUiSectionTestId(
  sectionKind: MetadataUiTestIdPart,
  sectionKey: MetadataUiTestIdPart,
  slot?: MetadataUiTestIdPart,
): string {
  return createMetadataUiStableTestId({
    surface: "section",
    kind: sectionKind,
    key: sectionKey,
    slot,
  });
}

export function createMetadataUiRendererTestId(
  rendererKey: MetadataUiTestIdPart,
  slot?: MetadataUiTestIdPart,
): string {
  return createMetadataUiStableTestId({
    surface: "renderer",
    key: rendererKey,
    slot,
  });
}

export function createMetadataUiFixtureTestId(
  fixtureKey: MetadataUiTestIdPart,
  slot?: MetadataUiTestIdPart,
): string {
  return createMetadataUiStableTestId({
    surface: "fixture",
    key: fixtureKey,
    slot,
  });
}
