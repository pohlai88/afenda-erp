"use client";

import type { RefObject } from "react";
import type { Cell, Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiTableClientModel,
  MetadataUiTableRowModel,
} from "../../runtime/table-state.shared";

export type MetadataUiVirtualListCellClassResolver = (
  cell: Cell<MetadataUiTableRowModel, unknown>,
) => string;

export type MetadataUiVirtualListRowClassResolver = (
  row: Row<MetadataUiTableRowModel>,
) => string;

export type MetadataUiVirtualListWindowProps = Readonly<{
  rows: readonly Row<MetadataUiTableRowModel>[];
  columnCount: number;
  virtualization: MetadataUiTableClientModel["virtualization"];
  scrollElementRef: RefObject<HTMLDivElement | null>;
  getCellClassName: MetadataUiVirtualListCellClassResolver;
  getRowClassName: MetadataUiVirtualListRowClassResolver;
}>;

function MetadataUiVirtualSpacerRow({
  height,
  columnCount,
}: Readonly<{
  height: number;
  columnCount: number;
}>) {
  if (height <= 0) {
    return null;
  }

  return (
    <TableRow aria-hidden="true">
      <TableCell
        colSpan={columnCount}
        className="p-0"
        style={{ height }}
      />
    </TableRow>
  );
}

export function MetadataUiVirtualListWindow({
  rows,
  columnCount,
  virtualization,
  scrollElementRef,
  getCellClassName,
  getRowClassName,
}: MetadataUiVirtualListWindowProps) {
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => virtualization.rowEstimate,
    overscan: virtualization.overscan,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const topPadding = virtualItems[0]?.start ?? 0;
  const bottomPadding =
    virtualItems.length > 0
      ? totalSize - (virtualItems.at(-1)?.end ?? 0)
      : 0;

  return (
    <TableBody
      data-metadata-ui-virtual-window="current-server-window"
      data-metadata-ui-virtual-row-count={rows.length}
    >
      <MetadataUiVirtualSpacerRow
        height={topPadding}
        columnCount={columnCount}
      />
      {virtualItems.map((virtualItem) => {
        const row = rows[virtualItem.index];

        if (!row) {
          return null;
        }

        return (
          <TableRow
            key={row.id}
            className={cn(ui.table.rowInteractive, getRowClassName(row))}
            data-index={virtualItem.index}
            data-selected={row.getIsSelected() || undefined}
            ref={rowVirtualizer.measureElement}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(ui.table.cell, getCellClassName(cell))}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
      <MetadataUiVirtualSpacerRow
        height={bottomPadding}
        columnCount={columnCount}
      />
    </TableBody>
  );
}
