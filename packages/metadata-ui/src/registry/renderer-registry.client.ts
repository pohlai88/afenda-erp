"use client";

import type { MetadataUiSectionKind } from "../contracts/section.contract";

export type MetadataUiClientRendererRegistryEntry = {
  readonly sectionKind: MetadataUiSectionKind;
  readonly availableOnClient: false;
};

export const METADATA_UI_CLIENT_RENDERER_REGISTRY = [] as const satisfies readonly MetadataUiClientRendererRegistryEntry[];

export function getMetadataUiClientRenderers(): typeof METADATA_UI_CLIENT_RENDERER_REGISTRY {
  return METADATA_UI_CLIENT_RENDERER_REGISTRY;
}
