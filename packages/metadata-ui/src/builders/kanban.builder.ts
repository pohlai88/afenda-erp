import { z } from "zod";

import {
  METADATA_UI_KANBAN_CARD_ACTION_SCHEMA,
  METADATA_UI_KANBAN_CARD_SCHEMA,
  METADATA_UI_KANBAN_CARD_TEMPLATE_SCHEMA,
  METADATA_UI_KANBAN_COLUMN_SCHEMA,
  METADATA_UI_KANBAN_TRANSITION_SCHEMA,
  METADATA_UI_KANBAN_SCHEMA,
  METADATA_UI_KANBAN_SWIMLANE_SCHEMA,
  type MetadataUiKanban,
  type MetadataUiKanbanBoardMode,
  type MetadataUiKanbanCard,
  type MetadataUiKanbanCardTemplate,
  type MetadataUiKanbanColumn,
  type MetadataUiKanbanTransition,
  type MetadataUiKanbanSwimlane,
} from "../schemas/kanban.schema";

type MetadataUiKanbanSystemFields = "schemaId" | "schemaVersion" | "stability";

export type MetadataUiKanbanInput = z.input<typeof METADATA_UI_KANBAN_SCHEMA>;

export type MetadataUiKanbanColumnInput = z.input<
  typeof METADATA_UI_KANBAN_COLUMN_SCHEMA
>;

export type MetadataUiKanbanSwimlaneInput = z.input<
  typeof METADATA_UI_KANBAN_SWIMLANE_SCHEMA
>;

export type MetadataUiKanbanCardActionInput = z.input<
  typeof METADATA_UI_KANBAN_CARD_ACTION_SCHEMA
>;

export type MetadataUiKanbanCardTemplateInput = z.input<
  typeof METADATA_UI_KANBAN_CARD_TEMPLATE_SCHEMA
>;

export type MetadataUiKanbanCardInput = z.input<
  typeof METADATA_UI_KANBAN_CARD_SCHEMA
>;

export type MetadataUiKanbanTransitionInput = z.input<
  typeof METADATA_UI_KANBAN_TRANSITION_SCHEMA
>;

export type KanbanBuilderInput = Omit<
  MetadataUiKanbanInput,
  MetadataUiKanbanSystemFields
>;

export type MetadataUiKanbanBuilderResult<Input extends KanbanBuilderInput> =
  MetadataUiKanban & {
    key: Input["key"];
    columnField: Input["columnField"];
  };

export type MetadataUiKanbanCardAction = z.output<
  typeof METADATA_UI_KANBAN_CARD_ACTION_SCHEMA
>;

export type MetadataUiKanbanCardActionPlacement =
  MetadataUiKanbanCardAction["placement"];

export type MetadataUiKanbanCardActionForPlacement<
  Placement extends MetadataUiKanbanCardActionPlacement,
> = MetadataUiKanbanCardAction & {
  placement: Placement;
};

export type MetadataUiKanbanCardActionBuilderResult<
  Input extends MetadataUiKanbanCardActionInput,
> = Input extends {
  placement?: infer Placement extends MetadataUiKanbanCardActionPlacement;
}
  ? MetadataUiKanbanCardActionForPlacement<Placement>
  : MetadataUiKanbanCardAction;

export type MetadataUiKanbanBasicInput<
  Key extends string = string,
  ColumnField extends string = string,
  Columns extends readonly MetadataUiKanbanColumnInput[] = MetadataUiKanbanColumnInput[],
> = {
  key: Key;
  title?: string;
  description?: string;
  columnField: ColumnField;
  columns: Columns;
  cardTemplate: MetadataUiKanbanCardTemplateInput;
  footer?: MetadataUiKanbanInput["footer"];
};

export type MetadataUiKanbanSafeCreateResult<
  Data extends MetadataUiKanban = MetadataUiKanban,
> =
  | {
      success: true;
      data: Data;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

export type MetadataUiKanbanBoardBuilderResult<
  Input extends MetadataUiKanbanBasicInput,
> = MetadataUiKanbanBuilderResult<{
  key: Input["key"];
  columnField: Input["columnField"];
  columns: Input["columns"];
  cardTemplate: Input["cardTemplate"];
}> & {
  columns: Input["columns"];
  cardTemplate: Input["cardTemplate"];
};

export function createKanban<const Input extends KanbanBuilderInput>(
  input: Input,
): MetadataUiKanbanBuilderResult<Input> {
  return METADATA_UI_KANBAN_SCHEMA.parse(
    input,
  ) as MetadataUiKanbanBuilderResult<Input>;
}

export function createKanbanBoard<const Input extends MetadataUiKanbanBasicInput>(
  input: Input,
): MetadataUiKanbanBoardBuilderResult<Input> {
  return createKanban({
    key: input.key,
    title: input.title,
    description: input.description,
    columnField: input.columnField,
    columns: input.columns,
    swimlanes: [],
    cardTemplate: input.cardTemplate,
    cardActions: [],
    footer: input.footer,
  }) as MetadataUiKanbanBoardBuilderResult<Input>;
}

export function createKanbanColumn<
  const Input extends MetadataUiKanbanColumnInput,
>(input: Input): MetadataUiKanbanColumn {
  return METADATA_UI_KANBAN_COLUMN_SCHEMA.parse(input);
}

export function createKanbanSwimlane<
  const Input extends MetadataUiKanbanSwimlaneInput,
>(input: Input): MetadataUiKanbanSwimlane {
  return METADATA_UI_KANBAN_SWIMLANE_SCHEMA.parse(input);
}

export function createKanbanCardTemplate<
  const Input extends MetadataUiKanbanCardTemplateInput,
>(input: Input): MetadataUiKanbanCardTemplate {
  return METADATA_UI_KANBAN_CARD_TEMPLATE_SCHEMA.parse(input);
}

export function createKanbanCard<
  const Input extends MetadataUiKanbanCardInput,
>(input: Input): MetadataUiKanbanCard {
  return METADATA_UI_KANBAN_CARD_SCHEMA.parse(input);
}

export function createKanbanTransition<
  const Input extends MetadataUiKanbanTransitionInput,
>(input: Input): MetadataUiKanbanTransition {
  return METADATA_UI_KANBAN_TRANSITION_SCHEMA.parse(input);
}

export function createKanbanCardAction<
  const Input extends MetadataUiKanbanCardActionInput,
>(input: Input): MetadataUiKanbanCardActionBuilderResult<Input> {
  return METADATA_UI_KANBAN_CARD_ACTION_SCHEMA.parse(
    input,
  ) as MetadataUiKanbanCardActionBuilderResult<Input>;
}

export function withKanbanMode<const Input extends KanbanBuilderInput>(
  kanban: Input,
  mode: MetadataUiKanbanBoardMode,
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    mode,
  });
}

export function withKanbanMovement<const Input extends KanbanBuilderInput>(
  kanban: Input,
  movement: NonNullable<MetadataUiKanbanInput["movement"]>,
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    movement,
  });
}

export function withKanbanColumns<const Input extends KanbanBuilderInput>(
  kanban: Input,
  columns: MetadataUiKanbanColumnInput[],
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    columns,
  });
}

export function appendKanbanColumn<const Input extends KanbanBuilderInput>(
  kanban: Input,
  column: MetadataUiKanbanColumnInput,
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    columns: [...kanban.columns, column],
  });
}

export function withKanbanCards<const Input extends KanbanBuilderInput>(
  kanban: Input,
  cards: MetadataUiKanbanCardInput[],
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    cards,
  });
}

export function withKanbanTransitions<const Input extends KanbanBuilderInput>(
  kanban: Input,
  transitions: MetadataUiKanbanTransitionInput[],
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    transitions,
  });
}

export function withKanbanSwimlanes<const Input extends KanbanBuilderInput>(
  kanban: Input,
  swimlanes: MetadataUiKanbanSwimlaneInput[],
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    swimlanes,
  });
}

export function withKanbanCardActions<const Input extends KanbanBuilderInput>(
  kanban: Input,
  cardActions: MetadataUiKanbanCardActionInput[],
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    cardActions,
  });
}

export function appendKanbanCardAction<const Input extends KanbanBuilderInput>(
  kanban: Input,
  action: MetadataUiKanbanCardActionInput,
): MetadataUiKanbanBuilderResult<Input> {
  return createKanban({
    ...kanban,
    cardActions: [...(kanban.cardActions ?? []), action],
  });
}

export function safeCreateKanban(
  input: unknown,
): MetadataUiKanbanSafeCreateResult {
  const result = METADATA_UI_KANBAN_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
