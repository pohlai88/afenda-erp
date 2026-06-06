"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Badge, Button, ScrollArea } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiKanbanClientModel,
  MetadataUiKanbanMoveIntent,
} from "../../runtime/kanban-state.shared";

export type MetadataUiKanbanDragBoardProps = Readonly<{
  model: MetadataUiKanbanClientModel;
}>;

type MetadataUiKanbanCardState = Readonly<{
  cardKey: string;
  columnKey: string;
}>;

function createInitialKanbanCardState(
  model: MetadataUiKanbanClientModel,
): readonly MetadataUiKanbanCardState[] {
  return model.columns.flatMap((column) =>
    column.cards.map((card) => ({
      cardKey: card.key,
      columnKey: column.key,
    })),
  );
}

function getKanbanRecordText(
  record: Readonly<Record<string, string | number | boolean | null>>,
  field: string | undefined,
): string | undefined {
  if (!field) {
    return undefined;
  }

  const value = record[field];
  return value == null ? undefined : String(value);
}

function resolveKanbanTransition(
  transitions: readonly MetadataUiKanbanMoveIntent[],
  cardKey: string,
  toColumnKey: string,
): MetadataUiKanbanMoveIntent | undefined {
  return transitions.find(
    (transition) =>
      transition.cardKey === cardKey && transition.toColumnKey === toColumnKey,
  );
}

export function MetadataUiKanbanDragBoard({
  model,
}: MetadataUiKanbanDragBoardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [cardState, setCardState] = useState(() =>
    createInitialKanbanCardState(model),
  );
  const [draggingCardKey, setDraggingCardKey] = useState<string | null>(null);
  const modelSignature = useMemo(
    () =>
      JSON.stringify({
        key: model.key,
        columns: model.columns.map((column) => ({
          key: column.key,
          cards: column.cards.map((card) => card.key),
        })),
      }),
    [model],
  );
  const staticMotion =
    model.reducedMotion === "always-static" ||
    (model.reducedMotion === "respect-user" && prefersReducedMotion);
  const columnKeyByCard = useMemo(
    () => new Map(cardState.map((state) => [state.cardKey, state.columnKey])),
    [cardState],
  );

  useEffect(() => {
    setCardState(createInitialKanbanCardState(model));
    setDraggingCardKey(null);
  }, [model, modelSignature]);

  function moveCard(intent: MetadataUiKanbanMoveIntent) {
    if (!intent.available) {
      return;
    }

    setCardState((current) =>
      current.map((state) =>
        state.cardKey === intent.cardKey
          ? {
              ...state,
              columnKey: intent.toColumnKey,
            }
          : state,
      ),
    );
  }

  function moveDraggedCardToColumn(toColumnKey: string) {
    if (!draggingCardKey) {
      return;
    }

    const fromColumnKey = columnKeyByCard.get(draggingCardKey);
    const sourceColumn = model.columns.find((column) => column.key === fromColumnKey);
    const intent = sourceColumn
      ? resolveKanbanTransition(sourceColumn.transitions, draggingCardKey, toColumnKey)
      : undefined;

    if (intent) {
      moveCard(intent);
    }

    setDraggingCardKey(null);
  }

  return (
    <div
      className={cn("metadata-ui-kanban-board grid md:grid-cols-3", ui.surfaceGap.md)}
      data-metadata-ui-kanban={model.key}
      data-metadata-ui-kanban-mode={model.mode}
      data-metadata-ui-movement-enabled={model.movementEnabled}
    >
      {model.swimlanes.length > 0 ? (
        <div className={cn("metadata-ui-kanban-swimlanes flex flex-wrap md:col-span-3", ui.surfaceGap.xs)}>
          {model.swimlanes.map((swimlane) => (
            <Badge key={swimlane.key} variant="outline">
              {swimlane.label}: {swimlane.cardCount}
            </Badge>
          ))}
        </div>
      ) : null}
      {model.columns.map((column) => {
        const cards = model.columns
          .flatMap((sourceColumn) => sourceColumn.cards)
          .filter(
            (card) => columnKeyByCard.get(card.key) === column.key,
          );

        return (
          <section
            key={column.key}
            className={cn("min-w-0", ui.radius.section, ui.surface.inset, ui.padding.card)}
            data-metadata-ui-kanban-column={column.key}
            onDragOver={(event) => {
              if (model.movementEnabled && draggingCardKey) {
                event.preventDefault();
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              moveDraggedCardToColumn(column.key);
            }}
            aria-describedby={
              column.disabledReason ? `${column.key}-drop-reason` : undefined
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {column.label}
                </h3>
                {column.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {column.description}
                  </p>
                ) : null}
              </div>
              <Badge variant={column.dropEnabled ? "secondary" : "outline"}>
                {cards.length}
              </Badge>
            </div>
            {column.disabledReason ? (
              <p id={`${column.key}-drop-reason`} className="mt-2 text-xs text-muted-foreground">
                {column.disabledReason}
              </p>
            ) : null}
            <ScrollArea className="mt-3 max-h-96 pr-2">
              <div className={cn("grid", ui.surfaceGap.xs)}>
                {cards.length === 0 ? (
                  <div className={cn("border border-dashed text-sm text-muted-foreground", ui.radius.control, ui.surface.panel, ui.padding.dense)}>
                    No cards
                  </div>
                ) : null}
                {cards.map((card) => {
                  const title =
                    getKanbanRecordText(
                      card.record,
                      model.cardTemplate.titleField,
                    ) ?? card.key;
                  const description = getKanbanRecordText(
                    card.record,
                    model.cardTemplate.descriptionField,
                  );
                  const availableTargets = model.columns.filter(
                    (targetColumn) => targetColumn.key !== column.key,
                  );

                  return (
                    <motion.article
                      key={card.key}
                      layout={!staticMotion}
                      draggable={model.movementEnabled && !card.disabledReason}
                      onDragStart={() => setDraggingCardKey(card.key)}
                      onDragEnd={() => setDraggingCardKey(null)}
                      className={cn(
                        "border shadow-sm",
                        ui.radius.control,
                        ui.surface.panel,
                        ui.padding.dense,
                        card.disabledReason && "opacity-70",
                      )}
                      data-metadata-ui-kanban-card={card.key}
                      data-metadata-ui-move-payload={JSON.stringify({
                        cardKey: card.key,
                        columnKey: column.key,
                      })}
                    >
                      <div className="grid gap-surface-2xs">
                        <h4 className="text-sm font-medium text-foreground">
                          {title}
                        </h4>
                        {description ? (
                          <p className="text-xs text-muted-foreground">{description}</p>
                        ) : null}
                        {card.disabledReason ? (
                          <p className="text-xs text-muted-foreground">
                            {card.disabledReason}
                          </p>
                        ) : null}
                      </div>
                      {model.cardTemplate.metadataFields.length > 0 ? (
                        <dl className="mt-3 grid gap-surface-2xs text-xs text-muted-foreground">
                          {model.cardTemplate.metadataFields.map((field) => (
                            <div key={field} className="flex justify-between gap-3">
                              <dt>{field}</dt>
                              <dd>{getKanbanRecordText(card.record, field)}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      {model.movementEnabled && availableTargets.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {availableTargets.map((targetColumn) => {
                            const intent = resolveKanbanTransition(
                              column.transitions,
                              card.key,
                              targetColumn.key,
                            );
                            const disabledReason =
                              intent?.disabledReason ??
                              "Move unavailable.";
                            const disabledReasonId = `${card.key}-${targetColumn.key}-move-reason`;

                            return (
                              <span key={targetColumn.key} className="inline-grid gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={!intent?.available}
                                  title={!intent?.available ? disabledReason : intent?.hint}
                                  aria-describedby={
                                    !intent?.available ? disabledReasonId : undefined
                                  }
                                  data-metadata-ui-move-intent={JSON.stringify(
                                    intent?.payload ?? {},
                                  )}
                                  onClick={() => {
                                    if (intent) {
                                      moveCard(intent);
                                    }
                                  }}
                                >
                                  {targetColumn.label}
                                </Button>
                                {!intent?.available ? (
                                  <span
                                    id={disabledReasonId}
                                    className="sr-only"
                                  >
                                    {disabledReason}
                                  </span>
                                ) : null}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}
                    </motion.article>
                  );
                })}
              </div>
            </ScrollArea>
          </section>
        );
      })}
    </div>
  );
}
