import "server-only";

import type { ReactNode } from "react";

import {
  extendMetadataUiRendererContext,
  type MetadataUiRendererDataContext,
} from "../runtime/renderer-context.server";
import {
  MetadataUiRenderStack,
  type MetadataUiRenderableSection,
  type MetadataUiRenderableSectionStackItem,
  type MetadataUiRenderableSectionStackSpan,
} from "./render-stack.server";

export type MetadataUiRenderableSectionTreeNode = Readonly<{
  section: MetadataUiRenderableSection;
  order?: number;
  span?: MetadataUiRenderableSectionStackSpan;
  children?: readonly MetadataUiRenderableSectionTreeNode[];
}>;

export type MetadataUiRenderChildTreeProps = Readonly<{
  roots: readonly MetadataUiRenderableSectionTreeNode[];
  context?: MetadataUiRendererDataContext;
}>;

function getMetadataUiTreeSectionKey(
  node: MetadataUiRenderableSectionTreeNode,
  index: number,
): string {
  const section = node.section;

  if (typeof section === "object" && section && "id" in section) {
    return String(section.id);
  }

  return `section.${index}`;
}

function createMetadataUiChildContext(
  nodes: readonly MetadataUiRenderableSectionTreeNode[],
  context: MetadataUiRendererDataContext | undefined,
): MetadataUiRendererDataContext {
  const childrenBySectionKey: Record<string, ReactNode> = {
    ...(context?.childrenBySectionKey ?? {}),
  };

  nodes.forEach((node, index) => {
    if (!node.children?.length) {
      return;
    }

    childrenBySectionKey[getMetadataUiTreeSectionKey(node, index)] = (
      <MetadataUiRenderChildTree roots={node.children} context={context} />
    );
  });

  return extendMetadataUiRendererContext(context, {
    childrenBySectionKey,
  });
}

function toMetadataUiStackItems(
  nodes: readonly MetadataUiRenderableSectionTreeNode[],
): readonly MetadataUiRenderableSectionStackItem[] {
  return nodes.map((node) => ({
    section: node.section,
    order: node.order,
    span: node.span,
  }));
}

export function MetadataUiRenderChildTree({
  roots,
  context,
}: MetadataUiRenderChildTreeProps) {
  return (
    <MetadataUiRenderStack
      sections={toMetadataUiStackItems(roots)}
      context={createMetadataUiChildContext(roots, context)}
    />
  );
}
