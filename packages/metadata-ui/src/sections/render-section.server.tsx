import "server-only";

import {
  resolveMetadataUiRenderSectionState,
  type MetadataUiRenderableSection,
  type MetadataUiRenderSectionProps,
} from "../renderers/render-section.server";
import { renderMetadataUiRegisteredSection } from "./render-registered-section.server";

export type {
  MetadataUiRenderableSection,
  MetadataUiRendererDataContext,
  MetadataUiRenderSectionProps,
  MetadataUiRenderSectionState,
} from "../renderers/render-section.server";

export { resolveMetadataUiRenderSectionState } from "../renderers/render-section.server";

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
      {renderMetadataUiRegisteredSection(state)}
    </section>
  );
}

export type MetadataUiSectionRendererInput = MetadataUiRenderableSection;
