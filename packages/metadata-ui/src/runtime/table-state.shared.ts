import type {
  MetadataUiList,
  MetadataUiListColumn,
  MetadataUiListColumnAlign,
  MetadataUiListColumnPinned,
  MetadataUiListDensity,
  MetadataUiListFilterOperator,
  MetadataUiListSelectionMode,
  MetadataUiListSortDirection,
  MetadataUiListTrailingCellKind,
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
  canSelect: boolean;
  selectionDisabledReason?: string;
  cells: Readonly<Record<string, MetadataUiTableCellValue>>;
  fieldValues: Readonly<Record<string, MetadataUiTableCellValue>>;
}>;

export type MetadataUiTableSortingModel = Readonly<{
  id: string;
  direction: MetadataUiListSortDirection;
}>;

export type MetadataUiTableRowActionModel = Readonly<{
  id: string;
  label: string;
  disabledReason: string;
  stateField?: string;
  disabledReasonField?: string;
}>;

export type MetadataUiTableTrailingCellModel = Readonly<{
  key: string;
  kind: MetadataUiListTrailingCellKind;
  label: string;
  field?: string;
  statusField?: string;
  documentKeyField?: string;
  stateField?: string;
  disabledReasonField?: string;
  actionId?: string;
  actionLabel?: string;
  hidden: boolean;
  disabledReason?: string;
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
  href?: string;
  disabledReason: string;
}>;

export type MetadataUiTableBulkActionModel = Readonly<{
  id: string;
  label: string;
  requiresSelection: boolean;
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
    bulkActions: readonly MetadataUiTableBulkActionModel[];
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
  trailingCells: readonly MetadataUiTableTrailingCellModel[];
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

function readMetadataUiTableBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (["false", "no", "disabled", "hidden", "locked", "0"].includes(normalizedValue)) {
      return false;
    }

    if (["true", "yes", "enabled", "available", "1"].includes(normalizedValue)) {
      return true;
    }
  }

  return fallback;
}

function addMetadataUiTableReferencedField(
  fields: Set<string>,
  field: string | undefined,
) {
  if (field) {
    fields.add(field);
  }
}

function collectMetadataUiTableReferencedFields(
  list: MetadataUiList,
  columns: readonly MetadataUiTableColumnModel[],
): ReadonlySet<string> {
  const fields = new Set<string>([
    list.rowKey,
    ...columns.map((column) => column.field),
  ]);

  addMetadataUiTableReferencedField(fields, list.selectableField);
  addMetadataUiTableReferencedField(fields, list.selectionDisabledReasonField);

  for (const rowAction of list.rowActions) {
    addMetadataUiTableReferencedField(fields, rowAction.stateField);
    addMetadataUiTableReferencedField(fields, rowAction.disabledReasonField);
  }

  for (const trailingCell of list.trailingCells) {
    addMetadataUiTableReferencedField(fields, trailingCell.field);
    addMetadataUiTableReferencedField(fields, trailingCell.statusField);
    addMetadataUiTableReferencedField(fields, trailingCell.documentKeyField);
    addMetadataUiTableReferencedField(fields, trailingCell.stateField);
    addMetadataUiTableReferencedField(fields, trailingCell.disabledReasonField);
  }

  return fields;
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
): MetadataUiTableRowModel {
  if (!(list.rowKey in row)) {
    throw new Error(
      `List row is missing required rowKey "${list.rowKey}". Metadata UI tables require stable row identity.`,
    );
  }

  const cells = columns.reduce<Record<string, MetadataUiTableCellValue>>(
    (accumulator, column) => {
      accumulator[column.key] = stringifyMetadataUiTableCellValue(
        row[column.field],
      );
      return accumulator;
    },
    {},
  );
  const fieldValues = [...collectMetadataUiTableReferencedFields(list, columns)].reduce<
    Record<string, MetadataUiTableCellValue>
  >(
    (accumulator, column) => {
      accumulator[column] = stringifyMetadataUiTableCellValue(row[column]);
      return accumulator;
    },
    {},
  );
  const canSelect = readMetadataUiTableBoolean(
    list.selectableField ? row[list.selectableField] : undefined,
    true,
  );
  const selectionDisabledReason = canSelect
    ? undefined
    : stringifyMetadataUiTableCellValue(
        list.selectionDisabledReasonField
          ? row[list.selectionDisabledReasonField]
          : undefined,
      ) || "Row selection is disabled by metadata.";

  return {
    id: String(row[list.rowKey]),
    canSelect,
    selectionDisabledReason,
    cells,
    fieldValues,
  };
}

function createMetadataUiTableDefaultSorting(
  list: MetadataUiList,
): readonly MetadataUiTableSortingModel[] {
  const sortableColumnKeyByField = new Map(
    list.columns
      .filter((column) => column.sortable)
      .map((column) => [column.field, column.key] as const),
  );

  return list.defaultSort
    .filter((sort) => sortableColumnKeyByField.has(sort.field))
    .map((sort) => ({
      id: sortableColumnKeyByField.get(sort.field) ?? sort.field,
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
      ...(rowAction.stateField ? { stateField: rowAction.stateField } : {}),
      ...(rowAction.disabledReasonField
        ? { disabledReasonField: rowAction.disabledReasonField }
        : {}),
    }));
}

function createMetadataUiTableTrailingCells(
  list: MetadataUiList,
): readonly MetadataUiTableTrailingCellModel[] {
  return list.trailingCells
    .filter((cell) => !cell.hidden)
    .map((cell) => ({
      key: cell.key,
      kind: cell.kind,
      label: cell.label,
      field: cell.field,
      statusField: cell.statusField,
      documentKeyField: cell.documentKeyField,
      ...(cell.stateField ? { stateField: cell.stateField } : {}),
      ...(cell.disabledReasonField
        ? { disabledReasonField: cell.disabledReasonField }
        : {}),
      ...(cell.action?.id ? { actionId: cell.action.id } : {}),
      ...(cell.action?.label ? { actionLabel: cell.action.label } : {}),
      hidden: cell.hidden,
      ...(cell.disabledReason || cell.kind === "action"
        ? {
            disabledReason:
              cell.disabledReason ??
              "Trailing action execution must be provided by the host feature.",
          }
        : {}),
    }));
}

function createMetadataUiTableToolbar(
  list: MetadataUiList,
): MetadataUiTableToolbarModel {
  const exportExecution = list.toolbar.exportAction?.execution;
  const exportHref =
    exportExecution?.kind === "navigation" ||
    exportExecution?.kind === "external-link"
      ? exportExecution.href
      : undefined;

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
          id: column.key,
          label: `${column.label} ascending`,
          direction: "asc" as const,
        },
        {
          id: column.key,
          label: `${column.label} descending`,
          direction: "desc" as const,
        },
      ]),
    exportAction: list.toolbar.exportAction
      ? {
          id: list.toolbar.exportAction.id,
          label: list.toolbar.exportAction.label,
          href: exportHref,
          disabledReason:
            list.toolbar.exportAction.disabledReason ??
            (exportHref
              ? "Export navigation is provided by the host feature."
              : "Export execution must be provided by the host feature."),
        }
      : undefined,
    bulkActions: list.bulkActions.map((bulkAction) => ({
      id: bulkAction.action.id,
      label: bulkAction.action.label,
      requiresSelection: bulkAction.requiresSelection,
      disabledReason:
        bulkAction.action.disabledReason ??
        "Bulk action execution must be provided by the host feature.",
    })),
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
    rows: rows.map((row) => createMetadataUiTableRowModel(list, columns, row)),
    defaultSorting: createMetadataUiTableDefaultSorting(list),
    rowActions: createMetadataUiTableRowActions(list),
    trailingCells: createMetadataUiTableTrailingCells(list),
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
    model.trailingCells.length > 0 ||
    model.toolbar.bulkActions.length > 0 ||
    model.columns.some(
      (column) => column.sortable || column.pinned || column.hidden,
    )
  );
}
