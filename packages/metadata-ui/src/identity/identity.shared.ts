import type { MetadataUiSectionKind } from "../contracts/section.contract";
import {
  createMetadataUiDiagnosticsIdentity,
  type MetadataUiDiagnosticsIdentity,
  type MetadataUiDiagnosticsInput,
} from "./diagnostics.shared";
import {
  createMetadataUiDomAttributes,
  type MetadataUiDomAttributes,
} from "./dom-attributes.shared";
import { createMetadataUiTestId } from "./test-id.shared";

export type MetadataUiSectionIdentityInput = Readonly<{
  sectionKind: MetadataUiSectionKind;
  key: string;
  id?: string;
  diagnostics?: MetadataUiDiagnosticsInput;
}>;

export type MetadataUiSectionIdentity = Readonly<{
  id: string;
  diagnostics: MetadataUiDiagnosticsIdentity;
  domAttributes: MetadataUiDomAttributes;
}>;

function normalizeMetadataUiIdentityTextPart(
  part: string,
): string {
  return part.trim();
}

export function createMetadataUiSectionIdentity({
  sectionKind,
  key,
  id = createMetadataUiTestId("metadata-ui", sectionKind, key),
  diagnostics,
}: MetadataUiSectionIdentityInput): MetadataUiSectionIdentity {
  const normalizedKey = normalizeMetadataUiIdentityTextPart(key);
  const resolvedSectionKey = normalizedKey || sectionKind;
  const normalizedId =
    normalizeMetadataUiIdentityTextPart(id) ||
    createMetadataUiTestId("metadata-ui", sectionKind, resolvedSectionKey);
  const normalizedDiagnostics = createMetadataUiDiagnosticsIdentity(
    sectionKind,
    resolvedSectionKey,
    diagnostics,
  );

  return {
    id: normalizedId,
    diagnostics: normalizedDiagnostics,
    domAttributes: createMetadataUiDomAttributes(
      sectionKind,
      normalizedDiagnostics,
      normalizedId,
    ),
  };
}

export * from "./diagnostics.shared";
export * from "./dom-attributes.shared";
export * from "./test-id.shared";
