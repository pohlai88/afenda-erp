"use client";

import {
  METADATA_UI_COMPONENT_REGISTRY,
  getMetadataUiComponentsByRuntime,
  type MetadataUiComponentRegistryEntriesForRuntime,
} from "./component-registry.shared";

export const METADATA_UI_CLIENT_COMPONENT_REGISTRY =
  getMetadataUiComponentsByRuntime("client");

export type MetadataUiClientComponentRegistryEntry =
  MetadataUiComponentRegistryEntriesForRuntime<
    typeof METADATA_UI_COMPONENT_REGISTRY,
    "client"
  >;

export function getMetadataUiClientComponents(): MetadataUiClientComponentRegistryEntry[] {
  return METADATA_UI_CLIENT_COMPONENT_REGISTRY;
}
