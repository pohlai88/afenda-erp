import "server-only";

import type { MetadataUiRendererDataContext } from "../runtime/renderer-context.server";
import { resolveMetadataUiSectionInstanceKey } from "../contracts/section.contract";
import { cn } from "@afenda/ui/utils";
import {
  MetadataUiRenderSection,
  type MetadataUiRenderableSection,
} from "./render-section.server";

export type { MetadataUiRenderableSection } from "./render-section.server";
export type { MetadataUiRendererDataContext } from "../runtime/renderer-context.server";

export type MetadataUiRenderableSectionStackSpan =
  | "full"
  | "half"
  | "third"
  | "two-thirds"
  | "quarter";

export type MetadataUiRenderableSectionStackItem = Readonly<{
  section: MetadataUiRenderableSection;
  order?: number;
  span?: MetadataUiRenderableSectionStackSpan;
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

  if (typeof section === "object" && section && "id" in section && "kind" in section) {
    return resolveMetadataUiSectionInstanceKey(
      section as Parameters<typeof resolveMetadataUiSectionInstanceKey>[0],
    );
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

const METADATA_UI_STACK_SPAN_CLASS = {
  full: "col-span-12",
  half: "col-span-12 xl:col-span-6",
  third: "col-span-12 lg:col-span-6 xl:col-span-4",
  "two-thirds": "col-span-12 xl:col-span-8",
  quarter: "col-span-12 sm:col-span-6 xl:col-span-3",
} as const satisfies Record<MetadataUiRenderableSectionStackSpan, string>;

function getMetadataUiStackItemClassName(
  item: MetadataUiRenderableSectionStackItem,
): string {
  return METADATA_UI_STACK_SPAN_CLASS[item.span ?? "full"];
}

export function MetadataUiRenderStack({
  sections,
  context,
  className = "metadata-ui-render-stack grid grid-cols-12 gap-surface-md",
}: MetadataUiRenderStackProps) {
  const orderedSections = orderMetadataUiRenderableSections(sections);

  return (
    <div className={className}>
      {orderedSections.map((item, index) => (
        <div
          key={getMetadataUiStackSectionKey(item, index)}
          className={cn("min-w-0", getMetadataUiStackItemClassName(item))}
        >
          <MetadataUiRenderSection section={item.section} context={context} />
        </div>
      ))}
    </div>
  );
}
