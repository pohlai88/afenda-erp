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

function normalizeMetadataUiIdentityTextPart(
  part: string | undefined,
): string | undefined {
  const normalized = part?.trim();
  return normalized ? normalized : undefined;
}

export function createMetadataUiDiagnosticsIdentity(
  sectionKind: MetadataUiSectionKind,
  key: string,
  diagnostics: MetadataUiDiagnosticsInput = {},
): MetadataUiDiagnosticsIdentity {
  const normalizedComponentKey = normalizeMetadataUiIdentityTextPart(
    diagnostics.componentKey,
  );
  const normalizedSectionKey = normalizeMetadataUiIdentityTextPart(
    diagnostics.sectionKey,
  );
  const normalizedRendererKey = normalizeMetadataUiIdentityTextPart(
    diagnostics.rendererKey,
  );
  const normalizedTestId = normalizeMetadataUiIdentityTextPart(diagnostics.testId);

  return {
    componentKey:
      normalizedComponentKey ?? `metadata-ui.section.${sectionKind}`,
    sectionKey: normalizedSectionKey ?? key,
    rendererKey:
      normalizedRendererKey ?? `metadata-ui.renderer.${sectionKind}`,
    testId:
      normalizedTestId ??
      createMetadataUiTestId("metadata-ui", sectionKind, key),
  };
}
