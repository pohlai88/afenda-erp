import type { MetadataUiComponentContract } from "../contracts/component.contract";
import type { MetadataUiRuntime } from "../contracts/runtime.contract";
import type { MetadataUiSectionKind } from "../contracts/section.contract";
import {
  METADATA_UI_COMPONENT_REGISTRY,
  getMetadataUiComponentsByRuntime,
} from "../registry/component-registry.shared";
import { MetadataUiRuntimeError } from "./runtime-error.shared";

export type MetadataUiRuntimeComponentResolution = Readonly<{
  runtime: MetadataUiRuntime;
  sectionKind: MetadataUiSectionKind;
  sectionComponent?: MetadataUiComponentContract;
  rendererComponent?: MetadataUiComponentContract;
  clientComponents: readonly MetadataUiComponentContract[];
}>;

function hasMetadataUiSectionKindMetadata(
  component: MetadataUiComponentContract,
  sectionKind: MetadataUiSectionKind,
): boolean {
  return component.metadata["sectionKind"] === sectionKind;
}

export function getMetadataUiRuntimeComponentsForSectionKind(
  sectionKind: MetadataUiSectionKind,
): MetadataUiRuntimeComponentResolution {
  const sectionComponent = METADATA_UI_COMPONENT_REGISTRY.find(
    (component) =>
      component.kind === "section" &&
      hasMetadataUiSectionKindMetadata(component, sectionKind),
  );

  const rendererComponent = METADATA_UI_COMPONENT_REGISTRY.find(
    (component) =>
      component.kind === "renderer" &&
      hasMetadataUiSectionKindMetadata(component, sectionKind),
  );

  return {
    runtime: "server",
    sectionKind,
    sectionComponent,
    rendererComponent,
    clientComponents: getMetadataUiComponentsByRuntime("client").filter(
      (component) => hasMetadataUiSectionKindMetadata(component, sectionKind),
    ),
  };
}

export function assertMetadataUiRuntimeSectionRegistered(
  sectionKind: MetadataUiSectionKind,
): MetadataUiRuntimeComponentResolution {
  const resolution = getMetadataUiRuntimeComponentsForSectionKind(sectionKind);

  if (!resolution.sectionComponent) {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.component-not-registered",
      `Metadata UI section "${sectionKind}" is not registered.`,
      { runtime: "server", sectionKind },
    );
  }

  if (!resolution.rendererComponent) {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.renderer-not-registered",
      `Metadata UI renderer component for section "${sectionKind}" is not registered.`,
      { runtime: "server", sectionKind },
    );
  }

  return resolution;
}

export function hasMetadataUiRuntimeSectionRegistration(
  sectionKind: MetadataUiSectionKind,
): boolean {
  const resolution = getMetadataUiRuntimeComponentsForSectionKind(sectionKind);
  return Boolean(resolution.sectionComponent && resolution.rendererComponent);
}
