import type { MetadataUiSectionKind } from "../contracts/section.contract";
import type { MetadataUiDiagnosticsIdentity } from "./diagnostics.shared";

export type MetadataUiDomAttributes = Readonly<{
  id?: string;
  "data-metadata-ui-kind": MetadataUiSectionKind;
  "data-metadata-ui-component": string;
  "data-metadata-ui-section": string;
  "data-metadata-ui-renderer": string;
  "data-testid": string;
}>;

export function createMetadataUiDomAttributes(
  sectionKind: MetadataUiSectionKind,
  identity: MetadataUiDiagnosticsIdentity,
  id?: string,
): MetadataUiDomAttributes {
  return {
    id,
    "data-metadata-ui-kind": sectionKind,
    "data-metadata-ui-component": identity.componentKey,
    "data-metadata-ui-section": identity.sectionKey,
    "data-metadata-ui-renderer": identity.rendererKey,
    "data-testid": identity.testId,
  };
}
