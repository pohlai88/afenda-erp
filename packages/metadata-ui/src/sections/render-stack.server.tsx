import "server-only";

import type { MetadataUiRendererDataContext } from "../runtime/renderer-context.server";
import {
  MetadataUiRenderSection,
  type MetadataUiRenderableSection,
} from "./render-section.server";

export type { MetadataUiRenderableSection } from "./render-section.server";
export type { MetadataUiRendererDataContext } from "../runtime/renderer-context.server";

export type MetadataUiRenderableSectionStackItem = Readonly<{
  section: MetadataUiRenderableSection;
  order?: number;
}>;

export type MetadataUiRenderStackProps = Readonly<{
  sections: readonly MetadataUiRenderableSectionStackItem[];
  context?: MetadataUiRendererDataContext;
  className?: string;
}>;

function getMetadataUiStackSectionKey(
  item: MetadataUiRenderableSectionStackItem,
  index: number,
): string {
  const section = item.section;

  if (typeof section === "object" && section && "id" in section) {
    return String(section.id);
  }

  return `section:${index}`;
}

function orderMetadataUiRenderableSections(
  sections: readonly MetadataUiRenderableSectionStackItem[],
): readonly MetadataUiRenderableSectionStackItem[] {
  return [...sections].sort((left, right) => {
    const leftOrder = left.order ?? 0;
    const rightOrder = right.order ?? 0;

    return leftOrder - rightOrder;
  });
}

export function MetadataUiRenderStack({
  sections,
  context,
  className = "metadata-ui-render-stack space-y-4",
}: MetadataUiRenderStackProps) {
  const orderedSections = orderMetadataUiRenderableSections(sections);

  return (
    <div className={className}>
      {orderedSections.map((item, index) => (
        <div key={getMetadataUiStackSectionKey(item, index)}>
          <MetadataUiRenderSection section={item.section} context={context} />
        </div>
      ))}
    </div>
  );
}
