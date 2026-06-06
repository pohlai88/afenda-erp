import { z } from "zod";

import {
  METADATA_UI_LIST_BULK_ACTION_SCHEMA,
  METADATA_UI_LIST_COLUMN_SCHEMA,
  METADATA_UI_LIST_FILTER_SCHEMA,
  METADATA_UI_LIST_ROW_ACTION_SCHEMA,
  METADATA_UI_LIST_SCHEMA,
  METADATA_UI_LIST_SORT_SCHEMA,
  METADATA_UI_LIST_TOOLBAR_SCHEMA,
  parseMetadataUiList,
  type MetadataUiList,
  type MetadataUiListBulkAction,
  type MetadataUiListBulkActionInput,
  type MetadataUiListColumn,
  type MetadataUiListColumnForFormat,
  type MetadataUiListColumnFormat,
  type MetadataUiListColumnInput,
  type MetadataUiListFilter,
  type MetadataUiListFilterForOperator,
  type MetadataUiListFilterInput,
  type MetadataUiListFilterOperator,
  type MetadataUiListForDensity,
  type MetadataUiListForSelectionMode,
  type MetadataUiListInput,
  type MetadataUiListDensity,
  type MetadataUiListRowAction,
  type MetadataUiListRowActionForPlacement,
  type MetadataUiListRowActionInput,
  type MetadataUiListRowActionPlacement,
  type MetadataUiListSelectionMode,
  type MetadataUiListSort,
  type MetadataUiListSortInput,
  type MetadataUiListToolbar,
  type MetadataUiListToolbarInput,
  type MetadataUiListTrailingCellInput,
} from "../schemas/list.schema";

type MetadataUiListSystemFields = "schemaId" | "schemaVersion" | "stability";

export type ListBuilderInput = Omit<
  MetadataUiListInput,
  MetadataUiListSystemFields
>;

export type MetadataUiListBuilderResult<Input extends ListBuilderInput> =
  MetadataUiList &
    (Input extends {
      selectionMode?: infer SelectionMode extends MetadataUiListSelectionMode;
    }
      ? { selectionMode: SelectionMode }
      : object) &
    (Input extends { density?: infer Density extends MetadataUiListDensity }
      ? { density: Density }
      : object);

export type MetadataUiListColumnBuilderResult<
  Input extends MetadataUiListColumnInput,
> = Input extends {
  format?: infer Format extends MetadataUiListColumnFormat;
}
  ? MetadataUiListColumnForFormat<Format>
  : MetadataUiListColumn;

export type MetadataUiListFilterBuilderResult<
  Input extends MetadataUiListFilterInput,
> = Input extends {
  operator: infer Operator extends MetadataUiListFilterOperator;
}
  ? MetadataUiListFilterForOperator<Operator>
  : MetadataUiListFilter;

export type MetadataUiListRowActionBuilderResult<
  Input extends MetadataUiListRowActionInput,
> = Input extends {
  placement?: infer Placement extends MetadataUiListRowActionPlacement;
}
  ? MetadataUiListRowActionForPlacement<Placement>
  : MetadataUiListRowAction;

export type MetadataUiListColumnBasicInput<
  Key extends string = string,
  Field extends string = string,
  Label extends string = string,
> = Omit<MetadataUiListColumnInput, "field" | "key" | "label"> & {
  key: Key;
  field: Field;
  label: Label;
};

export type MetadataUiListFilterBasicInput<
  Key extends string = string,
  Field extends string = string,
  Label extends string = string,
> = Omit<MetadataUiListFilterInput, "field" | "key" | "label"> & {
  key: Key;
  field: Field;
  label: Label;
};

export type MetadataUiListBasicInput<
  Key extends string = string,
  Columns extends readonly MetadataUiListColumnInput[] = MetadataUiListColumnInput[],
> = {
  key: Key;
  title?: string;
  description?: string;
  columns: Columns;
};

export type MetadataUiListSafeCreateResult<
  Data extends MetadataUiList = MetadataUiList,
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

function normalizeMetadataUiListColumnInput(
  input: MetadataUiListColumnInput,
): MetadataUiListColumnInput {
  return {
    ...input,
    key: input.key.trim(),
    label: input.label.trim(),
    description: input.description?.trim(),
    field: input.field.trim(),
  };
}

function normalizeMetadataUiListFilterInput(
  input: MetadataUiListFilterInput,
): MetadataUiListFilterInput {
  return {
    ...input,
    key: input.key.trim(),
    label: input.label.trim(),
    field: input.field.trim(),
  };
}

function normalizeMetadataUiListSortInput(
  input: MetadataUiListSortInput,
): MetadataUiListSortInput {
  return {
    ...input,
    field: input.field.trim(),
  };
}

function normalizeMetadataUiListRowActionInput(
  input: MetadataUiListRowActionInput,
): MetadataUiListRowActionInput {
  return {
    ...input,
    stateField: input.stateField?.trim(),
    disabledReasonField: input.disabledReasonField?.trim(),
  };
}

function normalizeMetadataUiListTrailingCellInput(
  input: MetadataUiListTrailingCellInput,
): MetadataUiListTrailingCellInput {
  return {
    ...input,
    key: input.key.trim(),
    label: input.label.trim(),
    field: input.field?.trim(),
    stateField: input.stateField?.trim(),
    disabledReasonField: input.disabledReasonField?.trim(),
    statusField: input.statusField?.trim(),
    documentKeyField: input.documentKeyField?.trim(),
    disabledReason: input.disabledReason?.trim(),
  };
}

function normalizeMetadataUiListSavedViewInput(
  input: NonNullable<MetadataUiListToolbarInput["savedViews"]>[number],
): NonNullable<MetadataUiListToolbarInput["savedViews"]>[number] {
  return {
    ...input,
    key: input.key.trim(),
    label: input.label.trim(),
    href: input.href?.trim(),
  };
}

function normalizeMetadataUiListToolbarInput(
  input: MetadataUiListToolbarInput,
): MetadataUiListToolbarInput {
  return {
    ...input,
    searchPlaceholder: input.searchPlaceholder?.trim(),
    savedViews: (input.savedViews ?? []).map((savedView) =>
      normalizeMetadataUiListSavedViewInput(savedView),
    ),
    resetLabel: input.resetLabel?.trim(),
  };
}

function normalizeMetadataUiListInput(input: ListBuilderInput): ListBuilderInput {
  return {
    ...input,
    key: input.key.trim(),
    title: input.title?.trim(),
    description: input.description?.trim(),
    rowKey: input.rowKey?.trim(),
    selectableField: input.selectableField?.trim(),
    selectionDisabledReasonField: input.selectionDisabledReasonField?.trim(),
    columns: input.columns.map((column) =>
      normalizeMetadataUiListColumnInput(column),
    ),
    filters: (input.filters ?? []).map((filter) =>
      normalizeMetadataUiListFilterInput(filter),
    ),
    defaultSort: (input.defaultSort ?? []).map((sort) =>
      normalizeMetadataUiListSortInput(sort),
    ),
    rowActions: (input.rowActions ?? []).map((rowAction) =>
      normalizeMetadataUiListRowActionInput(rowAction),
    ),
    trailingCells: (input.trailingCells ?? []).map((trailingCell) =>
      normalizeMetadataUiListTrailingCellInput(trailingCell),
    ),
    bulkActions: input.bulkActions,
    emptyStateKey: input.emptyStateKey?.trim(),
    diagnostics: input.diagnostics
      ? {
          ...input.diagnostics,
          componentKey: input.diagnostics.componentKey?.trim(),
          sectionKey: input.diagnostics.sectionKey?.trim(),
          rendererKey: input.diagnostics.rendererKey?.trim(),
          testId: input.diagnostics.testId?.trim(),
        }
      : input.diagnostics,
    toolbar: input.toolbar
      ? normalizeMetadataUiListToolbarInput(input.toolbar)
      : input.toolbar,
  };
}

export function createList<const Input extends ListBuilderInput>(
  input: Input,
): MetadataUiListBuilderResult<Input> {
  return parseMetadataUiList(
    normalizeMetadataUiListInput(input),
  ) as MetadataUiListBuilderResult<Input>;
}

export function createListForSelectionMode<
  const SelectionMode extends MetadataUiListSelectionMode,
>(
  input: Omit<ListBuilderInput, "selectionMode">,
  selectionMode: SelectionMode,
): MetadataUiListForSelectionMode<SelectionMode> {
  return createList({
    ...input,
    selectionMode,
  });
}

export function createListForDensity<const Density extends MetadataUiListDensity>(
  input: Omit<ListBuilderInput, "density">,
  density: Density,
): MetadataUiListForDensity<Density> {
  return createList({
    ...input,
    density,
  });
}

export function createListTable<const Input extends MetadataUiListBasicInput>(
  input: Input,
): MetadataUiListBuilderResult<{
  key: Input["key"];
  columns: Input["columns"];
  selectionMode: "none";
  density: "comfortable";
}> {
  return createList({
    key: input.key,
    title: input.title,
    description: input.description,
    columns: input.columns,
    selectionMode: "none",
    density: "comfortable",
  });
}

export function createListColumn<const Input extends MetadataUiListColumnInput>(
  input: Input,
): MetadataUiListColumnBuilderResult<Input> {
  return METADATA_UI_LIST_COLUMN_SCHEMA.parse(
    normalizeMetadataUiListColumnInput(input),
  ) as MetadataUiListColumnBuilderResult<Input>;
}

export function createTextColumn(
  input: Omit<MetadataUiListColumnInput, "format">,
): MetadataUiListColumnForFormat<"text"> {
  return createListColumn({
    ...input,
    format: "text",
  });
}

export function createNumberColumn(
  input: Omit<MetadataUiListColumnInput, "format">,
): MetadataUiListColumnForFormat<"number"> {
  return createListColumn({
    ...input,
    format: "number",
  });
}

export function createCurrencyColumn(
  input: Omit<MetadataUiListColumnInput, "format">,
): MetadataUiListColumnForFormat<"currency"> {
  return createListColumn({
    ...input,
    format: "currency",
  });
}

export function createDateColumn(
  input: Omit<MetadataUiListColumnInput, "format">,
): MetadataUiListColumnForFormat<"date"> {
  return createListColumn({
    ...input,
    format: "date",
  });
}

export function createStatusColumn(
  input: Omit<MetadataUiListColumnInput, "format">,
): MetadataUiListColumnForFormat<"status"> {
  return createListColumn({
    ...input,
    format: "status",
  });
}

export function createListFilter<const Input extends MetadataUiListFilterInput>(
  input: Input,
): MetadataUiListFilterBuilderResult<Input> {
  return METADATA_UI_LIST_FILTER_SCHEMA.parse(
    normalizeMetadataUiListFilterInput(input),
  ) as MetadataUiListFilterBuilderResult<Input>;
}

export function createEqualsFilter<
  const Input extends Omit<MetadataUiListFilterBasicInput, "operator">,
>(input: Input): MetadataUiListFilterForOperator<"equals"> {
  return createListFilter({
    ...input,
    operator: "equals",
  });
}

export function createContainsFilter<
  const Input extends Omit<MetadataUiListFilterBasicInput, "operator">,
>(input: Input): MetadataUiListFilterForOperator<"contains"> {
  return createListFilter({
    ...input,
    operator: "contains",
  });
}

export function createListSort<const Input extends MetadataUiListSortInput>(
  input: Input,
): MetadataUiListSort {
  return METADATA_UI_LIST_SORT_SCHEMA.parse(
    normalizeMetadataUiListSortInput(input),
  ) as MetadataUiListSort;
}

export function createListRowAction<
  const Input extends MetadataUiListRowActionInput,
>(input: Input): MetadataUiListRowActionBuilderResult<Input> {
  return METADATA_UI_LIST_ROW_ACTION_SCHEMA.parse(
    normalizeMetadataUiListRowActionInput(input),
  ) as MetadataUiListRowActionBuilderResult<Input>;
}

export function createListBulkAction<const Input extends MetadataUiListBulkActionInput>(
  input: Input,
): MetadataUiListBulkAction {
  return METADATA_UI_LIST_BULK_ACTION_SCHEMA.parse(
    input,
  ) as MetadataUiListBulkAction;
}

export function createListToolbar<const Input extends MetadataUiListToolbarInput>(
  input: Input,
): MetadataUiListToolbar {
  return METADATA_UI_LIST_TOOLBAR_SCHEMA.parse(
    normalizeMetadataUiListToolbarInput(input),
  );
}

export function withListColumns(
  list: MetadataUiListInput,
  columns: MetadataUiListColumnInput[],
): MetadataUiList {
  return createList({
    ...list,
    columns,
  });
}

export function appendListColumn(
  list: MetadataUiListInput,
  column: MetadataUiListColumnInput,
): MetadataUiList {
  return createList({
    ...list,
    columns: [...list.columns, column],
  });
}

export function withListFilters(
  list: MetadataUiListInput,
  filters: MetadataUiListFilterInput[],
): MetadataUiList {
  return createList({
    ...list,
    filters,
  });
}

export function withListRowActions(
  list: MetadataUiListInput,
  rowActions: MetadataUiListRowActionInput[],
): MetadataUiList {
  return createList({
    ...list,
    rowActions,
  });
}

export function appendListRowAction(
  list: MetadataUiListInput,
  rowAction: MetadataUiListRowActionInput,
): MetadataUiList {
  return createList({
    ...list,
    rowActions: [...(list.rowActions ?? []), rowAction],
  });
}

export function withListBulkActions(
  list: MetadataUiListInput,
  bulkActions: MetadataUiListBulkActionInput[],
): MetadataUiList {
  return createList({
    ...list,
    bulkActions,
  });
}

export function withListToolbar(
  list: MetadataUiListInput,
  toolbar: MetadataUiListToolbarInput,
): MetadataUiList {
  return createList({
    ...list,
    toolbar,
  });
}

export function appendListBulkAction(
  list: MetadataUiListInput,
  bulkAction: MetadataUiListBulkActionInput,
): MetadataUiList {
  return createList({
    ...list,
    bulkActions: [...(list.bulkActions ?? []), bulkAction],
  });
}

export function safeCreateList(input: unknown): MetadataUiListSafeCreateResult {
  const result = METADATA_UI_LIST_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true as const,
    data: parseMetadataUiList(result.data),
  };
}
