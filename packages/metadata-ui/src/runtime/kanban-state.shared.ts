import type {
  MetadataUiKanban,
  MetadataUiKanbanCard,
  MetadataUiKanbanColumn,
  MetadataUiKanbanSwimlane,
  MetadataUiKanbanTransition,
} from "../schemas/kanban.schema";

export type MetadataUiKanbanMoveIntent = Readonly<{
  cardKey: string;
  fromColumnKey: string;
  toColumnKey: string;
  actionKey?: string;
  payload: Readonly<Record<string, unknown>>;
  confirmationRequired: boolean;
  available: boolean;
  disabledReason?: string;
  hint?: string;
}>;

export type MetadataUiKanbanSwimlaneModel = Readonly<{
  key: string;
  label: string;
  description?: string;
  order: number;
  cardCount: number;
}>;

export type MetadataUiKanbanColumnModel = Readonly<{
  key: string;
  label: string;
  description?: string;
  order: number;
  dropEnabled: boolean;
  disabledReason?: string;
  cards: readonly MetadataUiKanbanCard[];
  transitions: readonly MetadataUiKanbanMoveIntent[];
}>;

export type MetadataUiKanbanClientModel = Readonly<{
  key: string;
  mode: MetadataUiKanban["mode"];
  reducedMotion: MetadataUiKanban["reducedMotion"];
  movementEnabled: boolean;
  cardKeyField: string;
  columnField: string;
  cardTemplate: MetadataUiKanban["cardTemplate"];
  swimlaneField?: string;
  swimlanes: readonly MetadataUiKanbanSwimlaneModel[];
  columns: readonly MetadataUiKanbanColumnModel[];
}>;

function compareKanbanOrder(
  left: Pick<MetadataUiKanbanColumn | MetadataUiKanbanSwimlane, "key" | "order">,
  right: Pick<MetadataUiKanbanColumn | MetadataUiKanbanSwimlane, "key" | "order">,
): number {
  return left.order - right.order || left.key.localeCompare(right.key);
}

function getKanbanCardColumnKey(
  card: MetadataUiKanbanCard,
  columnField: string,
): string {
  const value = card.record[columnField];
  return typeof value === "string" ? value : "";
}

function createKanbanMoveIntent(input: {
  card: MetadataUiKanbanCard;
  fromColumnKey: string;
  toColumn: MetadataUiKanbanColumn;
  transition?: MetadataUiKanbanTransition;
  kanban: MetadataUiKanban;
}): MetadataUiKanbanMoveIntent {
  const disabledReason =
    input.card.disabledReason ??
    input.transition?.disabledReason ??
    input.toColumn.drop.disabledReason;
  const available =
    input.kanban.mode === "draggable" &&
    input.kanban.movement.enabled &&
    input.kanban.movement.allowColumnMove &&
    input.toColumn.drop.enabled &&
    input.transition?.available !== false &&
    !input.card.disabledReason;

  return {
    cardKey: input.card.key,
    fromColumnKey: input.fromColumnKey,
    toColumnKey: input.toColumn.key,
    actionKey: input.transition?.intent.actionKey,
    payload: {
      ...input.transition?.intent.payload,
      cardKey: input.card.key,
      fromColumnKey: input.fromColumnKey,
      toColumnKey: input.toColumn.key,
    },
    confirmationRequired: input.kanban.movement.requireConfirmation,
    available,
    disabledReason: available ? undefined : disabledReason ?? "Move unavailable.",
    hint: input.transition?.hint,
  };
}

export function createMetadataUiKanbanClientModel(
  kanban: MetadataUiKanban,
): MetadataUiKanbanClientModel {
  const orderedColumns = [...kanban.columns].sort(compareKanbanOrder);
  const orderedSwimlanes = [...kanban.swimlanes].sort(compareKanbanOrder);
  const cardsByColumn = new Map<string, MetadataUiKanbanCard[]>();
  const transitionsByPair = new Map<string, MetadataUiKanbanTransition>();

  for (const column of orderedColumns) {
    cardsByColumn.set(column.key, []);
  }

  for (const card of kanban.cards) {
    const columnKey = getKanbanCardColumnKey(card, kanban.columnField);
    cardsByColumn.get(columnKey)?.push(card);
  }

  for (const transition of kanban.transitions) {
    transitionsByPair.set(
      `${transition.fromColumnKey}->${transition.toColumnKey}`,
      transition,
    );
  }

  return {
    key: kanban.key,
    mode: kanban.mode,
    reducedMotion: kanban.reducedMotion,
    movementEnabled:
      kanban.mode === "draggable" &&
      kanban.movement.enabled &&
      kanban.movement.allowColumnMove,
    cardKeyField: kanban.cardKeyField,
    columnField: kanban.columnField,
    cardTemplate: kanban.cardTemplate,
    swimlaneField: kanban.swimlaneField,
    swimlanes: orderedSwimlanes.map((swimlane) => ({
      key: swimlane.key,
      label: swimlane.label,
      description: swimlane.description,
      order: swimlane.order,
      cardCount: kanban.cards.filter((card) => {
        const value = kanban.swimlaneField
          ? card.record[kanban.swimlaneField]
          : undefined;
        return value === swimlane.key;
      }).length,
    })),
    columns: orderedColumns.map((column) => {
      const cards = cardsByColumn.get(column.key) ?? [];
      const transitions = cards.flatMap((card) =>
        orderedColumns
          .filter((targetColumn) => targetColumn.key !== column.key)
          .map((targetColumn) =>
            createKanbanMoveIntent({
              card,
              fromColumnKey: column.key,
              toColumn: targetColumn,
              transition: transitionsByPair.get(
                `${column.key}->${targetColumn.key}`,
              ),
              kanban,
            }),
          ),
      );

      return {
        key: column.key,
        label: column.label,
        description: column.description,
        order: column.order,
        dropEnabled: column.drop.enabled,
        disabledReason: column.drop.disabledReason,
        cards,
        transitions,
      };
    }),
  };
}
