import type {
  MetadataUiList,
  MetadataUiListColumn,
  MetadataUiListColumnAlign,
  MetadataUiListColumnPinned,
  MetadataUiListDensity,
  MetadataUiListFilterOperator,
  MetadataUiListSelectionMode,
  MetadataUiListSortDirection,
  MetadataUiListToolbar,
  MetadataUiListVirtualization,
} from "../schemas/list.schema";

export type MetadataUiTableCellValue = string;

export type MetadataUiTableColumnModel = Readonly<{
  key: string;
  label: string;
  field: string;
  align: MetadataUiListColumnAlign;
  hidden: boolean;
  pinned?: MetadataUiListColumnPinned;
  sortable: boolean;
  width?: Readonly<{
    min?: number;
    ideal?: number;
    max?: number;
  }>;
}>;

export type MetadataUiTableRowModel = Readonly<{
  id: string;
  cells: Readonly<Record<string, MetadataUiTableCellValue>>;
}>;

export type MetadataUiTableSortingModel = Readonly<{
  id: string;
  direction: MetadataUiListSortDirection;
}>;

export type MetadataUiTableRowActionModel = Readonly<{
  id: string;
  label: string;
  disabledReason: string;
}>;

export type MetadataUiTableServerWindowModel = Readonly<{
  rowKey: string;
  rowCount: number;
  caption: string;
  ownsCurrentWindowOnly: true;
}>;

export type MetadataUiTableVirtualizationModel = Readonly<
  MetadataUiListVirtualization & {
    ownsCurrentWindowOnly: true;
  }
>;

export type MetadataUiTableToolbarFilterModel = Readonly<{
  key: string;
  label: string;
  field: string;
  operator: MetadataUiListFilterOperator;
  locked: boolean;
}>;

export type MetadataUiTableToolbarSavedViewModel = Readonly<{
  key: string;
  label: string;
  href?: string;
  active: boolean;
}>;

export type MetadataUiTableToolbarSortOptionModel = Readonly<{
  id: string;
  label: string;
  direction: MetadataUiListSortDirection;
}>;

export type MetadataUiTableToolbarExportModel = Readonly<{
  id: string;
  label: string;
  disabledReason: string;
}>;

export type MetadataUiTableToolbarModel = Readonly<
  Omit<
    MetadataUiListToolbar,
    "exportAction" | "savedViews" | "searchPlaceholder"
  > & {
    searchPlaceholder: string;
    filters: readonly MetadataUiTableToolbarFilterModel[];
    savedViews: readonly MetadataUiTableToolbarSavedViewModel[];
    sortOptions: readonly MetadataUiTableToolbarSortOptionModel[];
    exportAction?: MetadataUiTableToolbarExportModel;
  }
>;

export type MetadataUiTableClientModel = Readonly<{
  listKey: string;
  density: MetadataUiListDensity;
  selectionMode: MetadataUiListSelectionMode;
  columns: readonly MetadataUiTableColumnModel[];
  rows: readonly MetadataUiTableRowModel[];
  defaultSorting: readonly MetadataUiTableSortingModel[];
  rowActions: readonly MetadataUiTableRowActionModel[];
  serverWindow: MetadataUiTableServerWindowModel;
  virtualization: MetadataUiTableVirtualizationModel;
  toolbar: MetadataUiTableToolbarModel;
}>;

function stringifyMetadataUiTableCellValue(value: unknown): MetadataUiTableCellValue {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return "";
}

function createMetadataUiTableColumnModel(
  column: MetadataUiListColumn,
): MetadataUiTableColumnModel {
  return {
    key: column.key,
    label: column.label,
    field: column.field,
    align: column.align,
    hidden: column.hidden,
    pinned: column.pinned,
    sortable: column.sortable,
    width: column.width,
  };
}

function createMetadataUiTableRowModel(
  list: MetadataUiList,
  columns: readonly MetadataUiTableColumnModel[],
  row: Readonly<Record<string, unknown>>,
  rowIndex: number,
): MetadataUiTableRowModel {
  const cells = columns.reduce<Record<string, MetadataUiTableCellValue>>(
    (accumulator, column) => {
      accumulator[column.key] = stringifyMetadataUiTableCellValue(
        row[column.field],
      );
      return accumulator;
    },
    {},
  );

  return {
    id: String(row[list.rowKey] ?? rowIndex),
    cells,
  };
}

function createMetadataUiTableDefaultSorting(
  list: MetadataUiList,
): readonly MetadataUiTableSortingModel[] {
  const sortableFields = new Set(
    list.columns
      .filter((column) => column.sortable)
      .map((column) => column.field),
  );

  return list.defaultSort
    .filter((sort) => sortableFields.has(sort.field))
    .map((sort) => ({
      id: sort.field,
      direction: sort.direction,
    }));
}

function createMetadataUiTableRowActions(
  list: MetadataUiList,
): readonly MetadataUiTableRowActionModel[] {
  return list.rowActions
    .filter((rowAction) => rowAction.placement === "inline")
    .map((rowAction) => ({
      id: rowAction.action.id,
      label: rowAction.action.label,
      disabledReason:
        rowAction.action.disabledReason ??
        "Row action execution must be provided by the host feature.",
    }));
}

function createMetadataUiTableToolbar(
  list: MetadataUiList,
): MetadataUiTableToolbarModel {
  return {
    ...list.toolbar,
    searchPlaceholder: list.toolbar.searchPlaceholder,
    filters: list.filters.map((filter) => ({
      key: filter.key,
      label: filter.label,
      field: filter.field,
      operator: filter.operator,
      locked: filter.locked,
    })),
    savedViews: list.toolbar.savedViews.map((savedView) => ({
      key: savedView.key,
      label: savedView.label,
      href: savedView.href,
      active: savedView.active,
    })),
    sortOptions: list.columns
      .filter((column) => column.sortable)
      .flatMap((column) => [
        {
          id: column.field,
          label: `${column.label} ascending`,
          direction: "asc" as const,
        },
        {
          id: column.field,
          label: `${column.label} descending`,
          direction: "desc" as const,
        },
      ]),
    exportAction: list.toolbar.exportAction
      ? {
          id: list.toolbar.exportAction.id,
          label: list.toolbar.exportAction.label,
          disabledReason:
            list.toolbar.exportAction.disabledReason ??
            "Export execution must be provided by the host feature.",
        }
      : undefined,
  };
}

export function createMetadataUiTableClientModel(
  list: MetadataUiList,
  rows: readonly Readonly<Record<string, unknown>>[],
): MetadataUiTableClientModel {
  const columns = list.columns.map(createMetadataUiTableColumnModel);

  return {
    listKey: list.key,
    density: list.density,
    selectionMode: list.selectionMode,
    columns,
    rows: rows.map((row, rowIndex) =>
      createMetadataUiTableRowModel(list, columns, row, rowIndex),
    ),
    defaultSorting: createMetadataUiTableDefaultSorting(list),
    rowActions: createMetadataUiTableRowActions(list),
    serverWindow: {
      rowKey: list.rowKey,
      rowCount: rows.length,
      caption: `${rows.length} rows in the current server window.`,
      ownsCurrentWindowOnly: true,
    },
    virtualization: {
      ...list.virtualization,
      ownsCurrentWindowOnly: true,
    },
    toolbar: createMetadataUiTableToolbar(list),
  };
}

export function shouldRenderMetadataUiClientTable(
  model: MetadataUiTableClientModel,
): boolean {
  return (
    model.selectionMode !== "none" ||
    model.toolbar.enabled ||
    model.virtualization.enabled ||
    model.defaultSorting.length > 0 ||
    model.columns.some(
      (column) => column.sortable || column.pinned || column.hidden,
    )
  );
}
