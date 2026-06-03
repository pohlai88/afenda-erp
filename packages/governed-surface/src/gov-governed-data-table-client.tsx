"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/ui/table";

import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { governedIdentityAttributes } from "../utils/governed-identity.shared";

export type GovernedDataTableDensity = "compact" | "comfortable";

export type GovernedDataTableClientProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (originalRow: TData, index: number) => string;
  tableLabel: string;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  testId?: string;
  density?: GovernedDataTableDensity;
  className?: string;
  emptyLabel?: string;
};

export function GovernedDataTableClient<TData>({
  data,
  columns,
  getRowId,
  tableLabel,
  surfaceKey,
  sectionKey,
  componentKey = sectionKey ?? surfaceKey ?? "data-table",
  testId,
  density = "compact",
  className,
  emptyLabel = "No records found.",
}: GovernedDataTableClientProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library -- upstream `useReactTable` contract
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  const rows = table.getRowModel().rows;
  const columnCount = Math.max(table.getAllLeafColumns().length, 1);
  const renderState = rows.length === 0 ? "empty" : "ready";
  const resolvedTestId = testId ?? `governed:data-table:${componentKey}`;

  return (
    <Table
      density={density}
      aria-label={tableLabel}
      className={className}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey,
      })}
      {...diagnosticsDataAttributes({
        state: renderState,
        testId: resolvedTestId,
        componentType: "governed:data-table",
      })}
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} data-header-group-id={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                scope="col"
                data-column-id={header.column.id}
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

      <TableBody>
        {rows.length === 0 ? (
          <TableRow data-row-state="empty">
            <TableCell
              colSpan={columnCount}
              className="py-density-relaxed text-center type-muted"
            >
              {emptyLabel}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={row.id}
              data-row-id={row.id}
              data-row-index={row.index}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} data-column-id={cell.column.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
