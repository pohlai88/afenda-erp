import type { ReactNode } from "react";

import type {
  GovernedKanbanBoardConfiguration,
  KanbanCard,
  KanbanCardTransitionAvailability,
} from "./gov-kanban-board-schema";
import { GovernedKanbanTransitionHint } from "./gov-governed-kanban-transition-hint-client";
import {
  buildKanbanBoardDataAttributes,
  governedKanbanCardTestId,
} from "./kanban-surface-identity.shared";
import { isKanbanCardTransitionRenderable } from "./kanban-card-transition.shared";

import {
  groupCardsByColumn,
  KANBAN_DATA_NATURE_CLASS,
  kanbanGridClass,
  KanbanCardTile,
  KanbanColumnPanel,
  resolveKanbanColumns,
} from "./gov-kanban-board-presentation";
import { GovernedEmpty } from "./gov-governed-empty";
import { governedRendererCopy } from "./gov-governed-renderer-copy-shared";

export {
  groupCardsByColumn,
  KANBAN_DATA_NATURE_CLASS,
  kanbanGridClass,
  resolveKanbanColumns,
} from "./gov-kanban-board-presentation";

export type KanbanBoardViewProps = {
  board: GovernedKanbanBoardConfiguration;
  /** When set, board and cards use stable Playwright ids (`governed-kanban-board:{key}`). */
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  /** Server Actions / forms — required for `footer-actions` interaction mode. */
  renderCardFooter?: (card: KanbanCard) => ReactNode;
};

export function KanbanBoardView({
  board,
  surfaceKey,
  sectionKey,
  componentKey,
  renderCardFooter,
}: KanbanBoardViewProps) {
  const columns = resolveKanbanColumns(board);
  const cardsByColumn = groupCardsByColumn(board.cards);

  const boardDom = buildKanbanBoardDataAttributes({
    surfaceKey,
    sectionKey,
    componentKey,
    state: columns.length === 0 ? "empty" : "ready",
  });

  if (columns.length === 0) {
    return (
      <section
        aria-label={board.copy.boardAriaLabel}
        className={KANBAN_DATA_NATURE_CLASS[board.dataNature]}
        {...boardDom}
        data-interaction-mode={board.interactionMode}
      >
        <GovernedEmpty
          model={{
            variant: "muted",
            title: governedRendererCopy.empty.kanbanBoard.title,
            description: governedRendererCopy.empty.kanbanBoard.description,
            emptyId: "kanban-board-no-columns",
          }}
        />
      </section>
    );
  }

  return (
    <section
      aria-label={board.copy.boardAriaLabel}
      className={KANBAN_DATA_NATURE_CLASS[board.dataNature]}
      {...boardDom}
      data-interaction-mode={board.interactionMode}
    >
      <div className={kanbanGridClass(columns.length)}>
        {columns.map((column) => {
          const cards = cardsByColumn.get(column.id) ?? [];
          const headingId = `kanban-column-${column.id}-title`;

          return (
            <KanbanColumnPanel
              key={column.id}
              column={column}
              cards={cards}
              headingId={headingId}
              emptyColumnLabel={board.copy.emptyColumn}
              renderCard={(card) => (
                <li
                  key={card.id}
                  data-testid={
                    surfaceKey
                      ? governedKanbanCardTestId(surfaceKey, card.id)
                      : undefined
                  }
                >
                  <KanbanCardTile
                    card={card}
                    footer={
                      <>
                        {board.interactionMode === "read-only" &&
                        card.availableTransitions?.length ? (
          <KanbanTransitionHints
                            transitions={card.availableTransitions}
                            surfaceKey={surfaceKey}
                            sectionKey={sectionKey}
                            componentKey={componentKey}
                            cardId={card.id}
                          />
                        ) : null}
                        {board.interactionMode === "footer-actions" &&
                        renderCardFooter ? (
                          <div className="border-t border-border/60 pt-2">
                            {renderCardFooter(card)}
                          </div>
                        ) : null}
                      </>
                    }
                  />
                </li>
              )}
            />
          );
        })}
      </div>
    </section>
  );
}

function KanbanTransitionHints({
  transitions,
  surfaceKey,
  sectionKey,
  componentKey,
  cardId,
}: {
  transitions: readonly KanbanCardTransitionAvailability[];
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  cardId?: string;
}) {
  const visible = transitions.filter(isKanbanCardTransitionRenderable);
  if (visible.length === 0) return null;

  return (
    <ul
      className="flex flex-wrap gap-1 border-t border-border/60 pt-2"
      aria-label="Allowed transitions"
    >
      {visible.map((transition) => (
        <li key={transition.transitionId}>
          <GovernedKanbanTransitionHint
            transition={transition}
            surfaceKey={surfaceKey}
            sectionKey={sectionKey}
            componentKey={componentKey}
            cardId={cardId}
          />
        </li>
      ))}
    </ul>
  );
}
