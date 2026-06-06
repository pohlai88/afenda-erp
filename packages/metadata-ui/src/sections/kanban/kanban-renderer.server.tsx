import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { MetadataUiActionContract } from "../../contracts/action.contract";
import { createMetadataUiKanbanClientModel } from "../../runtime/kanban-state.shared";
import { type MetadataUiKanban, METADATA_UI_KANBAN_SCHEMA } from "../../schemas/kanban.schema";
import { MetadataUiPrimitiveDescriptionList } from "../../primitives/description-list.server";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";
import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiKanbanDragBoard } from "./kanban-drag-board.client";

export type MetadataUiKanbanRendererProps = Readonly<{
  metadata: MetadataUiKanban;
}>;

function formatMetadataUiKanbanReducedMotion(
  value: MetadataUiKanban["reducedMotion"],
) {
  if (value === "respect-user") {
    return "Respect user";
  }

  if (value === "always-static") {
    return "Always static";
  }

  return "Allow motion";
}

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
      <MetadataUiPrimitiveDescriptionList
        title="Board summary"
        description="Contract-backed metadata for the current kanban board."
        columns={3}
        items={[
          {
            key: "mode",
            label: "Mode",
            value: kanban.mode,
          },
          {
            key: "movement",
            label: "Movement",
            value: kanban.movement.enabled
              ? kanban.movement.requireConfirmation
                ? "Enabled · Confirmation required"
                : "Enabled"
              : "Disabled",
          },
          {
            key: "cards",
            label: "Cards",
            value: kanban.cards.length,
          },
          {
            key: "columns",
            label: "Columns",
            value: kanban.columns.length,
          },
          {
            key: "swimlanes",
            label: "Swimlanes",
            value: kanban.swimlanes.length,
          },
          {
            key: "motion",
            label: "Motion",
            value: formatMetadataUiKanbanReducedMotion(kanban.reducedMotion),
          },
        ]}
      />
      <MetadataUiKanbanDragBoard model={model} />
      {kanban.transitions.some((transition) => transition.hint) ? (
        <ul
          className={cn(ui.typography.caption, ui.color.ink.muted)}
          data-metadata-ui-kanban-hints="true"
        >
          {kanban.transitions
            .filter((transition) => transition.hint)
            .map((transition) => (
              <li key={transition.key}>{transition.hint}</li>
            ))}
        </ul>
      ) : null}
      {kanban.footer.enabled ? (
        <footer
          className="flex flex-wrap items-center justify-between gap-surface-sm"
          data-metadata-ui-kanban-footer="true"
        >
          <span className={cn(ui.typography.caption, ui.color.ink.muted)}>
            {kanban.footer.summaryLabel ?? `${kanban.cards.length} cards`}
          </span>
          {kanban.footer.showColumnCounts ? (
            <div className="flex flex-wrap items-center gap-surface-xs">
              {model.columns.map((column) => (
                <span
                  key={column.key}
                  className={cn(ui.typography.caption, ui.color.ink.muted)}
                >
                  {column.label}: {column.cards.length}
                </span>
              ))}
            </div>
          ) : null}
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
