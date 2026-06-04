import "server-only";

import type { MetadataUiRendererContract } from "../contracts/renderer.contract";
import type { MetadataUiSectionKind } from "../contracts/section.contract";
import {
  resolveMetadataUiRuntimeRendererForSectionKind,
  safeResolveMetadataUiRuntimeRendererForSectionKind,
} from "../runtime/resolve-renderer.server";
import type { MetadataUiRuntimeResolutionDiagnostics } from "../runtime/runtime-diagnostics.shared";

export type MetadataUiSectionBodyResolution = Readonly<{
  sectionKind: MetadataUiSectionKind;
  renderer: MetadataUiRendererContract;
  modulePath: string;
  exportName: string;
}>;

export function resolveMetadataUiSectionBody(
  sectionKind: MetadataUiSectionKind,
): MetadataUiSectionBodyResolution {
  const resolution =
    resolveMetadataUiRuntimeRendererForSectionKind(sectionKind);

  return {
    sectionKind,
    renderer: resolution.renderer,
    modulePath: resolution.renderer.modulePath,
    exportName: resolution.renderer.exportName,
  };
}

export function safeResolveMetadataUiSectionBody(
  sectionKind: MetadataUiSectionKind,
): MetadataUiRuntimeResolutionDiagnostics {
  return safeResolveMetadataUiRuntimeRendererForSectionKind(sectionKind);
}
