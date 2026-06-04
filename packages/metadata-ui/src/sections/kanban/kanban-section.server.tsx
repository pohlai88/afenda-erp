import "server-only";

import type { ReactNode } from "react";

import { type MetadataUiKanban, METADATA_UI_KANBAN_SCHEMA } from "../../schemas/kanban.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiKanbanRenderer } from "./kanban-renderer.server";

export type MetadataUiKanbanSectionProps = Readonly<{
  metadata: MetadataUiKanban;
  children?: ReactNode;
}>;

export function MetadataUiKanbanSection({
  metadata,
  children,
}: MetadataUiKanbanSectionProps) {
  const kanban = METADATA_UI_KANBAN_SCHEMA.parse(metadata);

  return (
    <MetadataUiSectionShell
      id={kanban.key}
      sectionKind="kanban"
      title={kanban.title}
      description={kanban.description}
      diagnostics={kanban.diagnostics}
    >
      {children ?? <MetadataUiKanbanRenderer metadata={kanban} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiKanbanSection;
