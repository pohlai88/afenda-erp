"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { ListColumn } from "./gov-list-surface-schema";
import type { ListSurfaceRow } from "./gov-list-surface-renderer-schema";

import { ListSurfaceCell } from "./list-surface-cell.client";
import type { ListSurfaceTableTrailingColumn } from "./list-surface-table.client";

export function buildListSurfaceColumnDefs(
  columns: readonly ListColumn[],
  trailingColumn?: ListSurfaceTableTrailingColumn,
): ColumnDef<ListSurfaceRow, unknown>[] {
  const defs: ColumnDef<ListSurfaceRow, unknown>[] = columns.map((column) => ({
    id: column.id,
    accessorFn: (row) => row.cells[column.id],
    header: column.header,
    enableSorting: column.enableClientSort ?? false,
    cell: ({ row }) => <ListSurfaceCell column={column} row={row.original} />,
  }));

  if (trailingColumn) {
    defs.push({
      id: "__trailing",
      header: trailingColumn.header,
      enableSorting: false,
      cell: ({ row }) => (
        <trailingColumn.Cell
          row={row.original}
          rowIndex={row.index}
          context={trailingColumn.context}
        />
      ),
    });
  }

  return defs;
}
