import "server-only";

import type { ReactNode } from "react";

import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { type MetadataUiListInput, parseMetadataUiList } from "../../schemas/list.schema";
import { MetadataUiListRenderer } from "./list-renderer.server";

export type MetadataUiListSectionProps = Readonly<{
  metadata: MetadataUiListInput;
  rows?: readonly Record<string, unknown>[];
  children?: ReactNode;
}>;

export function MetadataUiListSection({
  metadata,
  rows = [],
  children,
}: MetadataUiListSectionProps) {
  const list = parseMetadataUiList(metadata);

  return (
    <MetadataUiSectionShell
      id={list.key}
      sectionKind="list"
      title={list.title}
      description={list.description}
      presentation={list.presentation}
      diagnostics={list.diagnostics}
    >
      {children ?? <MetadataUiListRenderer metadata={list} rows={rows} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiListSection;
