import type { MetadataUiSectionKind } from "../contracts/section.contract";
import { createMetadataUiTestId } from "./test-id.shared";

export type MetadataUiDiagnosticsInput = Readonly<{
  componentKey?: string;
  sectionKey?: string;
  rendererKey?: string;
  testId?: string;
}>;

export type MetadataUiDiagnosticsIdentity = Readonly<{
  componentKey: string;
  sectionKey: string;
  rendererKey: string;
  testId: string;
}>;

export function createMetadataUiDiagnosticsIdentity(
  sectionKind: MetadataUiSectionKind,
  key: string,
  diagnostics: MetadataUiDiagnosticsInput = {},
): MetadataUiDiagnosticsIdentity {
  return {
    componentKey: diagnostics.componentKey ?? `metadata-ui.section.${sectionKind}`,
    sectionKey: diagnostics.sectionKey ?? key,
    rendererKey: diagnostics.rendererKey ?? `metadata-ui.renderer.${sectionKind}`,
    testId: diagnostics.testId ?? createMetadataUiTestId("metadata-ui", sectionKind, key),
  };
}
