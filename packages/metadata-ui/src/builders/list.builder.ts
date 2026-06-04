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

export function createList<const Input extends ListBuilderInput>(
  input: Input,
): MetadataUiListBuilderResult<Input> {
  return parseMetadataUiList(input) as MetadataUiListBuilderResult<Input>;
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
    input,
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
    input,
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
  return METADATA_UI_LIST_SORT_SCHEMA.parse(input) as MetadataUiListSort;
}

export function createListRowAction<
  const Input extends MetadataUiListRowActionInput,
>(input: Input): MetadataUiListRowActionBuilderResult<Input> {
  return METADATA_UI_LIST_ROW_ACTION_SCHEMA.parse(
    input,
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
  return METADATA_UI_LIST_TOOLBAR_SCHEMA.parse(input);
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
    success: true,
    data: parseMetadataUiList(result.data),
  };
}
