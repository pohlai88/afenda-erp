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
  title?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  footer?: ReactNode;
  emptyState?: ReactNode;
  className?: string;
  containerClassName?: string;
  shellClassName?: string;
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
  title,
  description,
  leading,
  trailing,
  footer,
  emptyState,
  className,
  containerClassName,
  shellClassName,
}: MetadataUiPrimitiveTableProps) {
  const visibleColumns = columns.filter((column) => !column.hidden);
  const hasRowActions = rows.some((row) => Boolean(row.actions));
  const columnCount = visibleColumns.length + (hasRowActions ? 1 : 0);
  const emptyColumnCount = Math.max(columnCount, 1);
  const hasShell = Boolean(title || description || leading || trailing || footer || shellClassName);

  const tableNode = (
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
        {rows.length > 0 ? (
          rows.map((row) => (
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
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={emptyColumnCount} className="py-10 text-center">
              {emptyState ?? (
                <div className={cn("grid justify-items-center gap-1", ui.color.ink.muted)}>
                  <p className={ui.typography.label}>No records found</p>
                  <p className={ui.typography.caption}>
                    Adjust your filters or create a new record to continue.
                  </p>
                </div>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (!hasShell) {
    return tableNode;
  }

  return (
    <section className={cn("metadata-ui-table-shell grid", ui.surfaceGap.sm, shellClassName)}>
      {(title || description || leading || trailing) ? (
        <div className="flex flex-wrap items-start justify-between gap-surface-sm">
          <div className="grid min-w-0 gap-surface-2xs">
            {title ? (
              <h2 className={cn(ui.typography.sectionTitle, ui.color.ink.foreground)}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className={cn(ui.typography.caption, ui.color.ink.muted)}>
                {description}
              </p>
            ) : null}
          </div>
          {(leading || trailing) ? (
            <div className="flex flex-wrap items-center gap-surface-xs">
              {leading ? <div className="min-w-0">{leading}</div> : null}
              {trailing ? <div className="min-w-0">{trailing}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {tableNode}
      {footer ? <div className="flex flex-wrap items-center gap-surface-xs">{footer}</div> : null}
    </section>
  );
}
