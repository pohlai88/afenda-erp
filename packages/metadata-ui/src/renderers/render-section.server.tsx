import "server-only";

import type { ReactNode } from "react";

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
  children?: ReactNode;
  domAttributes?: MetadataUiDomAttributes;
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

  return {
    section: {
      ...section,
      permission: sectionContext.permission,
      presentation: sectionContext.presentation,
    },
    renderer: resolution.renderer,
    children: sectionContext.children,
    domAttributes: sectionContext.domAttributes,
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
