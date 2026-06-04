import "server-only";

export {
  METADATA_UI_COMPONENT_REGISTRY,
  METADATA_UI_COMPONENT_REGISTRY_BY_ID,
  getMetadataUiComponentById,
  getMetadataUiComponentsByKind,
  getMetadataUiComponentsByRuntime,
  type MetadataUiComponentRegistryById,
  type MetadataUiComponentRegistryEntry,
  type MetadataUiComponentRegistryEntriesForKind,
  type MetadataUiComponentRegistryEntriesForRuntime,
  type MetadataUiComponentRegistryIds,
  type MetadataUiRegisteredComponentId,
} from "./component-registry.shared";

export const METADATA_UI_SERVER_COMPONENT_REGISTRY_RUNTIME = "server" as const;
