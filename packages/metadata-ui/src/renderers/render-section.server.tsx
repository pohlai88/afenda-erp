import "server-only";

import type { MetadataUiRendererContract } from "../contracts/renderer.contract";
import {
  parseMetadataUiSectionContract,
  type MetadataUiSectionContract,
  type MetadataUiSectionContractInput,
} from "../contracts/section.contract";
import type { MetadataUiDomAttributes } from "../identity/identity.shared";
import {
  resolveMetadataUiSectionRenderContext,
  type MetadataUiRendererDataContext,
} from "../runtime/renderer-context.server";
import { resolveMetadataUiRuntimeRendererForSectionKind } from "../runtime/resolve-renderer.server";
import { MetadataUiRuntimeError } from "../runtime/runtime-error.shared";

export type MetadataUiRenderableSection =
  | MetadataUiSectionContractInput
  | MetadataUiSectionContract;

export type { MetadataUiRendererDataContext } from "../runtime/renderer-context.server";

export type MetadataUiRenderSectionProps = Readonly<{
  section: MetadataUiRenderableSection;
  context?: MetadataUiRendererDataContext;
}>;

export type MetadataUiRenderSectionState = Readonly<{
  section: MetadataUiSectionContract;
  renderer: MetadataUiRendererContract;
  children?: import("react").ReactNode;
  domAttributes?: MetadataUiDomAttributes;
  rows?: readonly Record<string, unknown>[];
  capabilities: readonly string[];
  diagnosticsCount: number;
}>;

export function resolveMetadataUiRenderSectionState(
  sectionInput: MetadataUiRenderableSection,
  context?: MetadataUiRendererDataContext,
): MetadataUiRenderSectionState {
  const section = parseMetadataUiSectionContract(sectionInput);
  const resolution = resolveMetadataUiRuntimeRendererForSectionKind(section.kind);
  const sectionContext = resolveMetadataUiSectionRenderContext(section, context);

  const declaredRendererId = String(section.rendererId);
  const resolvedRendererId = String(resolution.renderer.id);
  const declaredSchemaId = String(section.schemaId);
  const resolvedSchemaId = String(resolution.renderer.schemaId);

  if (declaredRendererId !== resolvedRendererId) {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.invalid-renderer",
      `Metadata UI section "${section.id}" declares renderer "${section.rendererId}" but resolved renderer "${resolution.renderer.id}" for kind "${section.kind}".`,
      {
        runtime: "server",
        sectionKind: section.kind,
        rendererId: section.rendererId,
      },
    );
  }

  if (declaredSchemaId !== resolvedSchemaId) {
    throw new MetadataUiRuntimeError(
      "metadata-ui.runtime.invalid-renderer",
      `Metadata UI section "${section.id}" declares schema "${section.schemaId}" but renderer "${resolution.renderer.id}" expects "${resolution.renderer.schemaId}".`,
      {
        runtime: "server",
        sectionKind: section.kind,
        rendererId: resolution.renderer.id,
      },
    );
  }

  return {
    section: {
      ...section,
      permission: sectionContext.permission,
      presentation: sectionContext.presentation,
    },
    renderer: resolution.renderer,
    children: sectionContext.children,
    domAttributes: sectionContext.domAttributes,
    rows: sectionContext.rows,
    capabilities: sectionContext.capabilities,
    diagnosticsCount: sectionContext.diagnostics.length,
  };
}

export function MetadataUiRenderSection({
  section,
  context,
}: MetadataUiRenderSectionProps) {
  const state = resolveMetadataUiRenderSectionState(section, context);

  return (
    <section
      {...state.domAttributes}
      data-metadata-ui-section={state.section.id}
      data-metadata-ui-section-kind={state.section.kind}
      data-metadata-ui-renderer={state.renderer.id}
      data-metadata-ui-capabilities={state.capabilities.join(" ")}
      data-metadata-ui-diagnostics-count={state.diagnosticsCount}
    >
      {state.children}
    </section>
  );
}
