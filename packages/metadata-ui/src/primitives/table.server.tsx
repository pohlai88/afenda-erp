import "server-only";

import type { CSSProperties, ReactNode } from "react";
import {
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
  MetadataUiListColumnAlign,
  MetadataUiListDensity,
} from "../schemas/list.schema";

export type MetadataUiPrimitiveTableColumn = Readonly<{
  key: string;
  label: ReactNode;
  align?: MetadataUiListColumnAlign;
  hidden?: boolean;
  width?: Readonly<{
    min?: number;
    ideal?: number;
    max?: number;
  }>;
}>;

export type MetadataUiPrimitiveTableRow = Readonly<{
  key: string;
  cells: readonly ReactNode[];
  actions?: ReactNode;
}>;

export type MetadataUiPrimitiveTableProps = Readonly<{
  columns: readonly MetadataUiPrimitiveTableColumn[];
  rows: readonly MetadataUiPrimitiveTableRow[];
  density?: MetadataUiListDensity;
  caption?: ReactNode;
  className?: string;
  containerClassName?: string;
}>;

const TABLE_DENSITY_BY_LIST_DENSITY = {
  dense: "compact",
  compact: "compact",
  comfortable: "comfortable",
} as const satisfies Record<MetadataUiListDensity, UiDensity>;

const TABLE_ALIGN_CLASS_BY_COLUMN_ALIGN = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
} as const satisfies Record<MetadataUiListColumnAlign, string>;

function resolveMetadataUiPrimitiveTableDensity(
  density: MetadataUiListDensity = "comfortable",
): UiDensity {
  return TABLE_DENSITY_BY_LIST_DENSITY[density];
}

function resolveMetadataUiPrimitiveTableColumnStyle(
  column: MetadataUiPrimitiveTableColumn,
): CSSProperties | undefined {
  if (!column.width) {
    return undefined;
  }

  return {
    minWidth: column.width.min,
    width: column.width.ideal,
    maxWidth: column.width.max,
  };
}

export function MetadataUiPrimitiveTable({
  columns,
  rows,
  density = "comfortable",
  caption,
  className,
  containerClassName,
}: MetadataUiPrimitiveTableProps) {
  const visibleColumns = columns.filter((column) => !column.hidden);
  const hasRowActions = rows.some((row) => Boolean(row.actions));

  return (
    <Table
      density={resolveMetadataUiPrimitiveTableDensity(density)}
      containerClassName={cn(ui.surface.inset, containerClassName)}
      className={cn("metadata-ui-table", className)}
    >
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        <TableRow className={ui.table.headerRow}>
          {visibleColumns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                ui.table.headerCell,
                TABLE_ALIGN_CLASS_BY_COLUMN_ALIGN[column.align ?? "start"],
              )}
              style={resolveMetadataUiPrimitiveTableColumnStyle(column)}
            >
              {column.label}
            </TableHead>
          ))}
          {hasRowActions ? (
            <TableHead className={cn(ui.table.headerCell, "text-right")}>
              Actions
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key} className={ui.table.rowInteractive}>
            {visibleColumns.map((column, cellIndex) => (
              <TableCell
                key={column.key}
                className={cn(
                  ui.table.cell,
                  TABLE_ALIGN_CLASS_BY_COLUMN_ALIGN[column.align ?? "start"],
                )}
                style={resolveMetadataUiPrimitiveTableColumnStyle(column)}
              >
                {row.cells[cellIndex]}
              </TableCell>
            ))}
            {hasRowActions ? (
              <TableCell className={cn(ui.table.cell, "text-right")}>
                {row.actions}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
