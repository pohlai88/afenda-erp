"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Cell,
  CellContext,
  ColumnDef,
  ColumnPinningState,
  HeaderContext,
  Row,
  RowSelectionState,
  SortingState,
  Table as TanStackTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/ui";
import { type UiDensity, ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiTableClientModel,
  MetadataUiTableColumnModel,
  MetadataUiTableRowModel,
} from "../../runtime/table-state.shared";
import {
  MetadataUiClientListToolbar,
  type MetadataUiListToolbarSortValue,
} from "./list-toolbar.client";
import { MetadataUiVirtualListWindow } from "./list-virtual-window.client";

export type MetadataUiClientListTableProps = Readonly<{
  model: MetadataUiTableClientModel;
  className?: string;
}>;

const TABLE_DENSITY_BY_LIST_DENSITY = {
  dense: "compact",
  compact: "compact",
  comfortable: "comfortable",
} as const satisfies Record<MetadataUiTableClientModel["density"], UiDensity>;

const TABLE_ALIGN_CLASS_BY_COLUMN_ALIGN = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
} as const satisfies Record<MetadataUiTableColumnModel["align"], string>;

function createMetadataUiInitialSorting(
  model: MetadataUiTableClientModel,
): SortingState {
  return model.defaultSorting.map((sort) => ({
    id: sort.id,
    desc: sort.direction === "desc",
  }));
}

function createMetadataUiInitialVisibility(
  model: MetadataUiTableClientModel,
): VisibilityState {
  return model.columns.reduce<VisibilityState>((visibility, column) => {
    visibility[column.key] = !column.hidden;
    return visibility;
  }, {});
}

function createMetadataUiInitialColumnPinning(
  model: MetadataUiTableClientModel,
): ColumnPinningState {
  return model.columns.reduce<ColumnPinningState>(
    (pinning, column) => {
      if (column.pinned === "start") {
        pinning.left?.push(column.key);
      }

      if (column.pinned === "end") {
        pinning.right?.push(column.key);
      }

      return pinning;
    },
    {
      left: [],
      right: [
        ...(model.trailingCells.length > 0 ? ["metadata-ui-trailing-cells"] : []),
        ...(model.rowActions.length > 0 ? ["metadata-ui-row-actions"] : []),
      ],
    },
  );
}

function createMetadataUiSortValue(
  sorting: SortingState,
): MetadataUiListToolbarSortValue | "" {
  const firstSort = sorting[0];

  if (!firstSort) {
    return "";
  }

  return `${firstSort.id}:${firstSort.desc ? "desc" : "asc"}`;
}

function createMetadataUiSortingFromToolbarValue(
  value: MetadataUiListToolbarSortValue | "",
): SortingState {
  if (!value) {
    return [];
  }

  const [id, direction] = value.split(":");
  if (!id || (direction !== "asc" && direction !== "desc")) {
    return [];
  }

  return [
    {
      id,
      desc: direction === "desc",
    },
  ];
}

function filterMetadataUiTableRows(
  rows: readonly MetadataUiTableRowModel[],
  query: string,
): MetadataUiTableRowModel[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [...rows];
  }

  return rows.filter((row) =>
    Object.values(row.cells).some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );
}

function getMetadataUiHeaderCheckboxState(
  table: HeaderContext<MetadataUiTableRowModel, unknown>["table"],
): boolean | "indeterminate" {
  if (table.getIsAllPageRowsSelected()) {
    return true;
  }

  if (table.getIsSomePageRowsSelected()) {
    return "indeterminate";
  }

  return false;
}

function MetadataUiListSelectionHeader({
  table,
}: HeaderContext<MetadataUiTableRowModel, unknown>) {
  return (
    <Checkbox
      aria-label="Select all rows in the current server window"
      checked={getMetadataUiHeaderCheckboxState(table)}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
    />
  );
}

function MetadataUiListSelectionCell({
  row,
}: CellContext<MetadataUiTableRowModel, unknown>) {
  return (
    <Checkbox
      aria-label={`Select row ${row.id}`}
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
    />
  );
}

function MetadataUiSortableHeader({
  column,
  label,
}: HeaderContext<MetadataUiTableRowModel, unknown> & {
  label: string;
}) {
  const sortState = column.getIsSorted();
  const suffix =
    sortState === "asc" ? " ascending" : sortState === "desc" ? " descending" : "";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-mx-surface-xs"
      aria-label={`Sort by ${label}${suffix}`}
      onClick={column.getToggleSortingHandler()}
    >
      {label}
    </Button>
  );
}

function MetadataUiPlainHeader({ label }: Readonly<{ label: string }>) {
  return <span>{label}</span>;
}

function MetadataUiListActionCell({
  rowActions,
}: Readonly<{
  rowActions: MetadataUiTableClientModel["rowActions"];
}>) {
  return (
    <div className="inline-flex justify-end gap-surface-xs">
      {rowActions.map((action) => (
        <Button
          key={action.id}
          type="button"
          variant="ghost"
          size="sm"
          disabled
          title={action.disabledReason}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

function MetadataUiListTrailingCell({
  row,
  trailingCells,
}: Readonly<{
  row: Row<MetadataUiTableRowModel>;
  trailingCells: MetadataUiTableClientModel["trailingCells"];
}>) {
  return (
    <div className="inline-flex flex-wrap justify-end gap-surface-xs">
      {trailingCells.map((cell) => {
        const fieldKey =
          cell.kind === "status"
            ? cell.statusField
            : cell.kind === "document"
              ? cell.documentKeyField
              : cell.field;
        const value = fieldKey ? row.original.cells[fieldKey] : undefined;

        if (cell.kind === "action") {
          return (
            <Button
              key={cell.key}
              type="button"
              variant="ghost"
              size="sm"
              disabled
              title={cell.disabledReason}
            >
              {cell.actionLabel ?? cell.label}
            </Button>
          );
        }

        return (
          <span
            key={cell.key}
            className="text-muted-foreground"
            data-metadata-ui-trailing-cell-kind={cell.kind}
            title={cell.label}
          >
            {value || cell.label}
          </span>
        );
      })}
    </div>
  );
}

function createMetadataUiDataColumn(
  column: MetadataUiTableColumnModel,
): ColumnDef<MetadataUiTableRowModel, unknown> {
  return {
    id: column.key,
    accessorFn: (row) => row.cells[column.key] ?? "",
    header: (context) =>
      column.sortable ? (
        <MetadataUiSortableHeader {...context} label={column.label} />
      ) : (
        <MetadataUiPlainHeader label={column.label} />
      ),
    cell: (context) => context.getValue(),
    enableSorting: column.sortable,
    meta: {
      align: column.align,
      width: column.width,
    },
  };
}

function createMetadataUiSelectionColumn(): ColumnDef<MetadataUiTableRowModel> {
  return {
    id: "metadata-ui-row-selection",
    header: MetadataUiListSelectionHeader,
    cell: MetadataUiListSelectionCell,
    enableSorting: false,
    enableHiding: false,
  };
}

function createMetadataUiActionColumn(
  rowActions: MetadataUiTableClientModel["rowActions"],
): ColumnDef<MetadataUiTableRowModel> {
  return {
    id: "metadata-ui-row-actions",
    header: () => <span>Actions</span>,
    cell: () => <MetadataUiListActionCell rowActions={rowActions} />,
    enableSorting: false,
    enableHiding: false,
  };
}

function createMetadataUiTrailingColumn(
  trailingCells: MetadataUiTableClientModel["trailingCells"],
): ColumnDef<MetadataUiTableRowModel> {
  return {
    id: "metadata-ui-trailing-cells",
    header: () => <span>Details</span>,
    cell: ({ row }) => (
      <MetadataUiListTrailingCell row={row} trailingCells={trailingCells} />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

function createMetadataUiColumnDefinitions(
  model: MetadataUiTableClientModel,
): ColumnDef<MetadataUiTableRowModel>[] {
  const columns: ColumnDef<MetadataUiTableRowModel>[] = model.columns.map(
    createMetadataUiDataColumn,
  );

  if (model.selectionMode !== "none") {
    columns.unshift(createMetadataUiSelectionColumn());
  }

  if (model.rowActions.length > 0) {
    columns.push(createMetadataUiActionColumn(model.rowActions));
  }

  if (model.trailingCells.length > 0) {
    columns.push(createMetadataUiTrailingColumn(model.trailingCells));
  }

  return columns;
}

function getMetadataUiColumnAlignClass(
  column: unknown,
): string {
  const align =
    typeof column === "object" &&
    column &&
    "align" in column &&
    (column.align === "start" ||
      column.align === "center" ||
      column.align === "end")
      ? column.align
      : undefined;

  return TABLE_ALIGN_CLASS_BY_COLUMN_ALIGN[align ?? "start"];
}

function getMetadataUiCellAlignClass(
  cell: Cell<MetadataUiTableRowModel, unknown>,
): string {
  return cn(
    getMetadataUiColumnAlignClass(cell.column.columnDef.meta),
    getMetadataUiPinnedColumnClass(cell.column.getIsPinned()),
  );
}

function getMetadataUiPinnedColumnClass(
  pinned: false | "left" | "right",
): string {
  if (pinned === "left") {
    return "sticky left-0 z-10 bg-background";
  }

  if (pinned === "right") {
    return "sticky right-0 z-10 bg-background";
  }

  return "";
}

function getMetadataUiTableDensity(
  density: MetadataUiTableClientModel["density"],
): UiDensity {
  return TABLE_DENSITY_BY_LIST_DENSITY[density];
}

function getMetadataUiPinnedRowClass(row: Row<MetadataUiTableRowModel>): string {
  return row.getIsSelected() ? "data-[selected=true]:bg-muted/50" : "";
}

function MetadataUiListTableHeader({
  table,
}: Readonly<{
  table: TanStackTable<MetadataUiTableRowModel>;
}>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className={ui.table.headerRow}>
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              className={cn(
                ui.table.headerCell,
                getMetadataUiColumnAlignClass(header.column.columnDef.meta),
                getMetadataUiPinnedColumnClass(header.column.getIsPinned()),
              )}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

export function MetadataUiClientListTable({
  model,
  className,
}: MetadataUiClientListTableProps) {
  const virtualScrollRef = useRef<HTMLDivElement>(null);
  const columns = useMemo(() => createMetadataUiColumnDefinitions(model), [model]);
  const modelSignature = useMemo(
    () =>
      JSON.stringify({
        key: model.listKey,
        columnKeys: model.columns.map((column) => column.key),
        rows: model.rows.map((row) => row.id),
        trailingCells: model.trailingCells.map((cell) => cell.key),
        rowActions: model.rowActions.map((action) => action.id),
        density: model.density,
        defaultSorting: model.defaultSorting,
      }),
    [model],
  );
  const [sorting, setSorting] = useState<SortingState>(() =>
    createMetadataUiInitialSorting(model),
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    createMetadataUiInitialVisibility(model),
  );
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(() =>
    createMetadataUiInitialColumnPinning(model),
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [density, setDensity] =
    useState<MetadataUiTableClientModel["density"]>(model.density);
  const filteredRows = useMemo(
    () => filterMetadataUiTableRows(model.rows, searchQuery),
    [model.rows, searchQuery],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnPinning,
      rowSelection,
    },
    enableMultiRowSelection: model.selectionMode === "multiple",
    enableRowSelection: model.selectionMode !== "none",
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
  });
  const tableRows = table.getRowModel().rows;
  const selectedRowCount = table
    .getSelectedRowModel()
    .rows.filter((row) => row.getIsSelected()).length;

  useEffect(() => {
    setSearchQuery("");
    setDensity(model.density);
    setSorting(createMetadataUiInitialSorting(model));
    setColumnVisibility(createMetadataUiInitialVisibility(model));
    setColumnPinning(createMetadataUiInitialColumnPinning(model));
    setRowSelection({});
  }, [model, modelSignature]);

  function resetMetadataUiTableToolbarState() {
    setSearchQuery("");
    setDensity(model.density);
    setSorting(createMetadataUiInitialSorting(model));
    setColumnVisibility(createMetadataUiInitialVisibility(model));
    setColumnPinning(createMetadataUiInitialColumnPinning(model));
    setRowSelection({});
  }

  const toolbar = (
    <MetadataUiClientListToolbar
      toolbar={model.toolbar}
      density={density}
      rowCount={filteredRows.length}
      selectedRowCount={selectedRowCount}
      searchQuery={searchQuery}
      sortValue={createMetadataUiSortValue(sorting)}
      onSearchQueryChange={setSearchQuery}
      onDensityChange={setDensity}
      onSortChange={(value) =>
        setSorting(createMetadataUiSortingFromToolbarValue(value))
      }
      onReset={resetMetadataUiTableToolbarState}
    />
  );

  if (model.virtualization.enabled && tableRows.length > 0) {
    return (
      <div
        className={cn("grid", ui.surfaceGap.sm, className)}
        data-metadata-ui-server-window="current"
        data-metadata-ui-server-window-rows={model.serverWindow.rowCount}
      >
        {toolbar}
        <div
          ref={virtualScrollRef}
          className={cn(ui.surface.inset, "overflow-y-auto")}
          style={{ maxHeight: model.virtualization.maxHeight }}
        >
          <Table
            density={getMetadataUiTableDensity(density)}
            className="metadata-ui-table metadata-ui-table-tanstack"
          >
            <TableCaption>{model.serverWindow.caption}</TableCaption>
            <MetadataUiListTableHeader table={table} />
          <MetadataUiVirtualListWindow
            rows={tableRows}
            columnCount={table.getVisibleLeafColumns().length}
            virtualization={model.virtualization}
            scrollElementRef={virtualScrollRef}
            getCellClassName={getMetadataUiCellAlignClass}
            getRowClassName={getMetadataUiPinnedRowClass}
          />
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid", ui.surfaceGap.sm, className)}>
      {toolbar}
      <Table
        density={getMetadataUiTableDensity(density)}
        containerClassName={ui.surface.inset}
        className="metadata-ui-table metadata-ui-table-tanstack"
        data-metadata-ui-server-window="current"
        data-metadata-ui-server-window-rows={model.serverWindow.rowCount}
      >
        <TableCaption>{model.serverWindow.caption}</TableCaption>
        <MetadataUiListTableHeader table={table} />
        <TableBody>
          {tableRows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(ui.table.rowInteractive, getMetadataUiPinnedRowClass(row))}
              data-selected={row.getIsSelected() || undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    ui.table.cell,
                    getMetadataUiColumnAlignClass(cell.column.columnDef.meta),
                    getMetadataUiPinnedColumnClass(cell.column.getIsPinned()),
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
