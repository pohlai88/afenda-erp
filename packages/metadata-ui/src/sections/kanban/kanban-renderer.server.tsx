import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { MetadataUiActionContract } from "../../contracts/action.contract";
import { createMetadataUiKanbanClientModel } from "../../runtime/kanban-state.shared";
import { type MetadataUiKanban, METADATA_UI_KANBAN_SCHEMA } from "../../schemas/kanban.schema";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";
import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiKanbanDragBoard } from "./kanban-drag-board.client";

export type MetadataUiKanbanRendererProps = Readonly<{
  metadata: MetadataUiKanban;
}>;

export function MetadataUiKanbanRenderer({ metadata }: MetadataUiKanbanRendererProps) {
  const kanban = METADATA_UI_KANBAN_SCHEMA.parse(metadata);
  const model = createMetadataUiKanbanClientModel(kanban);

  if (kanban.cards.length === 0) {
    return (
      <MetadataUiEmptyState
        title="No kanban cards"
        description="No cards are available for this board."
      />
    );
  }

  return (
    <div
      className={cn("metadata-ui-kanban", ui.surfaceGap.md)}
      data-metadata-ui-kanban={kanban.key}
      data-metadata-ui-kanban-mode={kanban.mode}
      data-metadata-ui-kanban-cards={kanban.cards.length}
    >
      <MetadataUiKanbanDragBoard model={model} />
      {kanban.transitions.some((transition) => transition.hint) ? (
        <ul className={cn(ui.typography.caption, ui.color.ink.muted)}>
          {kanban.transitions
            .filter((transition) => transition.hint)
            .map((transition) => (
              <li key={transition.key}>{transition.hint}</li>
            ))}
        </ul>
      ) : null}
      {kanban.footer.enabled ? (
        <footer className="flex flex-wrap items-center justify-between gap-surface-sm">
          <span className={cn(ui.typography.caption, ui.color.ink.muted)}>
            {kanban.footer.summaryLabel ?? `${kanban.cards.length} cards`}
          </span>
          <div className="flex flex-wrap items-center gap-surface-xs">
            {kanban.footer.actions.map((entry) => (
              <MetadataUiPrimitiveActionButton
                key={entry.action.id}
                action={entry.action as MetadataUiActionContract}
                priority="secondary"
              />
            ))}
          </div>
        </footer>
      ) : null}
    </div>
  );
}

export default MetadataUiKanbanRenderer;
