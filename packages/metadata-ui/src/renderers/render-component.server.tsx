import "server-only";

import type { MetadataUiRendererDataContext } from "../runtime/renderer-context.server";
import {
  MetadataUiRenderSection,
  type MetadataUiRenderableSection,
} from "./render-section.server";

export type MetadataUiRenderableComponent = MetadataUiRenderableSection;

export type MetadataUiRenderComponentProps = Readonly<{
  component: MetadataUiRenderableComponent;
  context?: MetadataUiRendererDataContext;
}>;

export function MetadataUiRenderComponent({
  component,
  context,
}: MetadataUiRenderComponentProps) {
  return <MetadataUiRenderSection section={component} context={context} />;
}
