"use client";

import {
  Fragment,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Route } from "next";
import { ClipboardList, SlidersHorizontal } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@afenda/ui/badge";
import { Button } from "@afenda/ui/button";
import { Card, CardContent } from "@afenda/ui/card";
import { Checkbox } from "@afenda/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/ui/table";
import { GovernedEmpty } from "../../client";
import {
  buildGovernedListSurfaceDataAttributes,
  governedListRowTestId,
  governedListSurfaceTestId,
} from "../../client";
import type { EmptyState, ListColumn } from "../../schemas/list-surface.schema";
import type {
  ListSurfaceRendererDataNature,
  ListSurfacePresentation,
  ListSurfaceRow,
  ListSurfaceRowDecisionLedger,
  ListSurfaceRowTone,
} from "../../schemas/list-surface-renderer.schema";
import type { ListSurfaceToolbar } from "../../schemas/list-surface-toolbar.schema";
import type { GovernedListTrailingCellContext } from "../../schemas/list-trailing-cell-context.schema";
import type { uiDensity } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { buildListSurfaceColumnDefs } from "./list-surface-tanstack.shared";
import { ListSurfaceCell } from "./list-surface-cell.client";
import { ListSurfaceToolbarClient } from "./list-surface-toolbar.client";

const ROW_TONE_CLASS: Record<ListSurfaceRowTone, string> = {
  default: "",
  attention: "bg-warning/10",
  critical: "bg-critical/10",
};

const LEDGER_TONE_VARIANT: Record<
  NonNullable<ListSurfaceRowDecisionLedger["riskTone"]>,
  "outline" | "success" | "warning" | "critical"
> = {
  default: "outline",
  positive: "success",
  attention: "warning",
  critical: "critical",
};

function alignClass(align: ListColumn["align"]): string {
  switch (align) {
    case "center":
      return "text-center";
    case "end":
      return "text-right";
    default:
      return "text-left";
  }
}

function columnVisualClass(column: ListColumn | undefined): string {
  return cn(
    alignClass(column?.align),
    column?.wrap && "whitespace-normal",
    column?.clip && "max-w-[16rem] truncate", // audit-ds: ignore no-arbitrary-value — clip column max-width contract
    column?.pin === "start" && "sticky left-0 z-raised bg-card",
    column?.pin === "end" && "sticky right-0 z-raised bg-card",
  );
}

function columnVisualStyle(column: ListColumn | undefined): CSSProperties {
  return {
    minWidth: column?.minWidth,
    maxWidth: column?.maxWidth,
  };
}

function DecisionLedgerPanel({
  ledger,
  label,
}: {
  ledger: ListSurfaceRowDecisionLedger;
  label: string;
}) {
  const riskTone = ledger.riskTone ?? "default";
  return (
    <div className="surface-inset flex flex-col gap-2 rounded-section type-body">
      <div className="flex flex-wrap items-center gap-2">
        <ClipboardList className="size-4 text-muted-foreground" aria-hidden />
        <span className="type-body font-medium">{label}</span>
        <Badge variant={LEDGER_TONE_VARIANT[riskTone]}>{riskTone}</Badge>
      </div>
      {ledger.reason ? <p className="type-body">{ledger.reason}</p> : null}
      <dl className="grid gap-2 type-caption @sm:grid-cols-2">
        {ledger.policyLabel ? (
          <div>
            <dt className="type-caption font-medium text-foreground">Policy</dt>
            <dd>
              {ledger.policyHref ? (
                <Link href={ledger.policyHref as Route}>
                  {ledger.policyLabel}
                </Link>
              ) : (
                ledger.policyLabel
              )}
            </dd>
          </div>
        ) : null}
        {ledger.actorLabel ? (
          <div>
            <dt className="type-caption font-medium text-foreground">Actor</dt>
            <dd>{ledger.actorLabel}</dd>
          </div>
        ) : null}
        {ledger.occurredAt ? (
          <div>
            <dt className="type-caption font-medium text-foreground">
              Timestamp
            </dt>
            <dd>{ledger.occurredAt}</dd>
          </div>
        ) : null}
        {ledger.nextActionLabel ? (
          <div>
            <dt className="type-caption font-medium text-foreground">
              Next step
            </dt>
            <dd>{ledger.nextActionLabel}</dd>
          </div>
        ) : null}
      </dl>
      {ledger.evidenceHref ? (
        <Link
          href={ledger.evidenceHref as Route}
          className="inline-flex type-caption font-medium text-primary underline-offset-4 hover:underline"
        >
          Open evidence
        </Link>
      ) : null}
    </div>
  );
}

export type ListSurfaceRowTrailingCellProps = {
  row: ListSurfaceRow;
  rowIndex: number;
  context?: GovernedListTrailingCellContext;
};

export type ListSurfaceTableTrailingColumn = {
  header: string;
  Cell: ComponentType<ListSurfaceRowTrailingCellProps>;
  context?: GovernedListTrailingCellContext;
};

export type ListSurfaceTableClientProps = {
  columns: readonly ListColumn[];
  rows: readonly ListSurfaceRow[];
  surfaceKey?: string;
  columnsId?: string;
  dataNature?: ListSurfaceRendererDataNature;
  presentationVariant?: string;
  empty?: EmptyState;
  trailingColumn?: ListSurfaceTableTrailingColumn;
  density?: keyof typeof uiDensity;
  narrowMode?: "table" | "cards" | "auto";
  primaryColumnId?: string;
  stickyHeader?: boolean;
  virtualizeRowThreshold?: number;
  toolbar?: ListSurfaceToolbar;
  selection?: ListSurfacePresentation["selection"];
  grouping?: ListSurfacePresentation["grouping"];
  summary?: ListSurfacePresentation["summary"];
  decisionLedger?: ListSurfacePresentation["decisionLedger"];
  exportFormId?: string;
  exportTriggerElementId?: string;
  pagination?: {
    pageSize: number;
    hasNextPage?: boolean;
    nextCursor?: string;
    nextHref?: string;
    prevCursor?: string;
    prevHref?: string;
    totalCount?: number;
  };
};

export function ListSurfaceTableClient({
  columns,
  rows,
  surfaceKey,
  columnsId,
  dataNature,
  presentationVariant,
  empty,
  trailingColumn,
  density: initialDensity = "compact",
  narrowMode = "table",
  primaryColumnId,
  stickyHeader = false,
  virtualizeRowThreshold = 100,
  toolbar,
  selection,
  grouping,
  summary,
  decisionLedger,
  exportFormId,
  exportTriggerElementId,
  pagination,
}: ListSurfaceTableClientProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [density, setDensity] =
    useState<keyof typeof uiDensity>(initialDensity);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [expandedLedgerRowIds, setExpandedLedgerRowIds] = useState<Set<string>>(
    new Set(),
  );

  const visibleColumns = useMemo(
    () => columns.filter((column) => !hiddenColumns.has(column.id)),
    [columns, hiddenColumns],
  );

  const columnDefs = useMemo(
    () => buildListSurfaceColumnDefs(visibleColumns, trailingColumn),
    [visibleColumns, trailingColumn],
  );

  // TanStack Table returns unstable function refs — safe for this leaf table shell.
  // eslint-disable-next-line react-hooks/incompatible-library -- governed list kernel
  const table = useReactTable({
    data: [...rows],
    columns: columnDefs,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const listState = rows.length === 0 ? "empty" : "ready";
  const listTestId = surfaceKey
    ? governedListSurfaceTestId(surfaceKey)
    : undefined;
  const governedDataAttrs = buildGovernedListSurfaceDataAttributes({
    surfaceKey,
    columnsId,
    dataNature,
    presentationVariant,
    density,
    state: listState,
  });

  const tableRows = table.getRowModel().rows;
  const groupedRenderItems = useMemo(() => {
    if (!grouping?.groups.length) {
      return tableRows.map((row) => ({
        type: "row" as const,
        id: row.id,
        row,
      }));
    }

    const tableRowById = new Map(
      tableRows.map((row) => [row.original.id, row]),
    );
    const groupedRowIds = new Set<string>();
    const items: Array<
      | { type: "group"; id: string; label: string; rowCount: number }
      | { type: "row"; id: string; row: (typeof tableRows)[number] }
    > = [];

    for (const group of grouping.groups) {
      const rowsInGroup = group.rowIds
        .map((rowId) => tableRowById.get(rowId))
        .filter((row): row is (typeof tableRows)[number] => Boolean(row));
      if (rowsInGroup.length === 0) {
        continue;
      }
      items.push({
        type: "group",
        id: group.id,
        label: group.label,
        rowCount: rowsInGroup.length,
      });
      for (const row of rowsInGroup) {
        groupedRowIds.add(row.original.id);
        items.push({ type: "row", id: row.id, row });
      }
    }

    for (const row of tableRows) {
      if (!groupedRowIds.has(row.original.id)) {
        items.push({ type: "row", id: row.id, row });
      }
    }
    return items;
  }, [grouping?.groups, tableRows]);

  const hasGrouping = Boolean(grouping?.groups.length);
  const useVirtual = !hasGrouping && tableRows.length > virtualizeRowThreshold;

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (density === "compact" ? 40 : 48),
    overscan: 10,
  });

  const toggleColumn = (columnId: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const primaryColumn =
    visibleColumns.find((column) => column.id === primaryColumnId) ??
    visibleColumns.find((column) => column.priority === "primary") ??
    visibleColumns[0];
  const detailColumns = visibleColumns.filter(
    (column) => column.id !== primaryColumn?.id,
  );
  const showCards = narrowMode === "cards" || narrowMode === "auto";
  const showTable = narrowMode === "table" || narrowMode === "auto";
  const tableVisibilityClass =
    narrowMode === "auto"
      ? "hidden @md:block"
      : narrowMode === "cards"
        ? "hidden"
        : undefined;
  const cardVisibilityClass =
    narrowMode === "auto"
      ? "@md:hidden"
      : narrowMode === "table"
        ? "hidden"
        : undefined;
  const cardRows = tableRows.map((row) => row.original);
  const TrailingCell = trailingColumn?.Cell;
  const selectionMode = selection?.mode ?? "none";
  const showSelection = selectionMode !== "none";
  const showDecisionLedger =
    decisionLedger?.enabled !== false &&
    rows.some((row) => row.decisionLedger !== undefined);
  const tableColumnCount =
    visibleColumns.length +
    (trailingColumn ? 1 : 0) +
    (showSelection ? 1 : 0) +
    (showDecisionLedger ? 1 : 0);

  const navigateToRow = (row: ListSurfaceRow) => {
    if (row.rowHref) {
      router.push(row.rowHref as Route);
    }
  };

  const toggleRowSelection = (rowId: string) => {
    setSelectedRowIds((prev) => {
      if (selectionMode === "single") {
        return prev.has(rowId) ? new Set() : new Set([rowId]);
      }
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const toggleAllRows = () => {
    setSelectedRowIds((prev) => {
      if (prev.size === rows.length) {
        return new Set();
      }
      return new Set(rows.map((row) => row.id));
    });
  };

  const toggleLedger = (rowId: string) => {
    setExpandedLedgerRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const shell = (
    <div className="flex flex-col gap-2">
      <ListSurfaceToolbarClient
        toolbar={toolbar}
        density={density}
        onDensityChange={toolbar?.densityToggle ? setDensity : undefined}
        columnIds={columns.map((column) => column.id)}
        hiddenColumnIds={hiddenColumns}
        onToggleColumn={toggleColumn}
        exportFormId={exportFormId}
        exportTriggerElementId={
          exportTriggerElementId ?? toolbar?.export?.triggerElementId
        }
        selectedCount={selectedRowIds.size}
        selectionLabel={selection?.bulkScopeLabel ?? selection?.label}
      />
      {rows.length === 0 && empty ? (
        <GovernedEmpty model={empty} />
      ) : (
        <>
          {showCards ? (
            <div className={cn("flex flex-col gap-2", cardVisibilityClass)}>
              {cardRows.map((source, rowIndex) => {
                const tone = source.rowTone ?? "default";
                return (
                  <Card
                    key={source.id}
                    className={cn(
                      "shadow-none",
                      ROW_TONE_CLASS[tone],
                      source.rowHref && "cursor-pointer hover:bg-muted/40",
                    )}
                    data-testid={
                      surfaceKey
                        ? `${governedListRowTestId(surfaceKey, source.id)}:card`
                        : undefined
                    }
                    tabIndex={source.rowHref ? 0 : undefined}
                    onClick={() => navigateToRow(source)}
                    onKeyDown={(event) => {
                      if (
                        source.rowHref &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        navigateToRow(source);
                      }
                    }}
                  >
                    <CardContent className="flex flex-col gap-2 p-3">
                      {primaryColumn ? (
                        <div className="type-body font-medium">
                          <ListSurfaceCell
                            column={primaryColumn}
                            row={source}
                          />
                        </div>
                      ) : null}
                      <dl className="grid grid-cols-1 gap-2 @sm:grid-cols-2">
                        {detailColumns.map((column) => (
                          <div key={column.id} className="min-w-0">
                            <dt className="type-caption">
                              {column.header}
                            </dt>
                            <dd className="type-body">
                              <ListSurfaceCell column={column} row={source} />
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {source.decisionLedger && showDecisionLedger ? (
                        <DecisionLedgerPanel
                          ledger={source.decisionLedger}
                          label={decisionLedger?.label ?? "Decision ledger"}
                        />
                      ) : null}
                      {TrailingCell && trailingColumn ? (
                        <div className="pt-1">
                          <TrailingCell
                            row={source}
                            rowIndex={rowIndex}
                            context={trailingColumn.context}
                          />
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : null}
          {showTable ? (
            <div
              ref={scrollRef}
              className={cn(
                tableVisibilityClass,
                useVirtual && "max-h-[32rem] overflow-auto", // audit-ds: ignore no-arbitrary-value — virtual scroll viewport height contract
                stickyHeader && "relative",
              )}
            >
              <Table density={density}>
                <TableHeader
                  className={cn(
                    stickyHeader && "sticky top-0 z-raised bg-card shadow-elevation-1",
                  )}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {showSelection ? (
                        <TableHead className="w-10">
                          {selectionMode === "multiple" ? (
                            <Checkbox
                              aria-label={selection?.label ?? "Select all rows"}
                              checked={
                                selectedRowIds.size > 0 &&
                                selectedRowIds.size === rows.length
                              }
                              onCheckedChange={toggleAllRows}
                            />
                          ) : null}
                        </TableHead>
                      ) : null}
                      {headerGroup.headers.map((header) => {
                        const column = visibleColumns.find(
                          (entry) => entry.id === header.column.id,
                        );
                        const canSort = column?.enableClientSort;
                        return (
                          <TableHead
                            key={header.id}
                            className={columnVisualClass(column)}
                            style={columnVisualStyle(column)}
                            aria-sort={
                              canSort && header.column.getIsSorted()
                                ? header.column.getIsSorted() === "asc"
                                  ? "ascending"
                                  : "descending"
                                : undefined
                            }
                          >
                            {header.isPlaceholder ? null : canSort ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  className="type-label inline-flex items-center gap-1 font-medium hover:text-foreground"
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </button>
                                {column?.headerAction ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    disabled={!column.headerAction.href}
                                    aria-label={column.headerAction.label}
                                    onClick={() => {
                                      if (column.headerAction?.href) {
                                        router.push(
                                          column.headerAction.href as Route,
                                        );
                                      }
                                    }}
                                  >
                                    <SlidersHorizontal
                                      className="size-3.5"
                                      aria-hidden
                                    />
                                  </Button>
                                ) : null}
                                {column?.resizable ? (
                                  <span
                                    aria-hidden
                                    className="h-4 w-px bg-border"
                                  />
                                ) : null}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                {column?.headerAction ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    disabled={!column.headerAction.href}
                                    aria-label={column.headerAction.label}
                                    onClick={() => {
                                      if (column.headerAction?.href) {
                                        router.push(
                                          column.headerAction.href as Route,
                                        );
                                      }
                                    }}
                                  >
                                    <SlidersHorizontal
                                      className="size-3.5"
                                      aria-hidden
                                    />
                                  </Button>
                                ) : null}
                                {column?.resizable ? (
                                  <span
                                    aria-hidden
                                    className="h-4 w-px bg-border"
                                  />
                                ) : null}
                              </div>
                            )}
                          </TableHead>
                        );
                      })}
                      {showDecisionLedger ? (
                        <TableHead className="w-24">
                          {decisionLedger?.label ?? "Decision"}
                        </TableHead>
                      ) : null}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {(useVirtual
                    ? virtualizer.getVirtualItems().map((virtualRow) => ({
                        type: "row" as const,
                        rowIndex: virtualRow.index,
                        key: `virtual-${virtualRow.index}`,
                      }))
                    : groupedRenderItems.map((item, rowIndex) => ({
                        type: item.type,
                        rowIndex,
                        item,
                        key: item.id,
                      }))
                  ).map(({ rowIndex, key }) => {
                    const renderItem = useVirtual
                      ? { type: "row" as const, row: tableRows[rowIndex] }
                      : groupedRenderItems[rowIndex];
                    if (renderItem?.type === "group") {
                      return (
                        <TableRow key={key} className="bg-muted/40">
                          <TableCell
                            colSpan={tableColumnCount}
                            className="type-label"
                          >
                            {renderItem.label} · {renderItem.rowCount} rows
                          </TableCell>
                        </TableRow>
                      );
                    }
                    const row = renderItem?.row;
                    if (!row) {
                      return null;
                    }
                    const source = row.original;
                    const tone = source.rowTone ?? "default";
                    return (
                      <Fragment key={key}>
                        <TableRow
                          data-testid={
                            surfaceKey
                              ? governedListRowTestId(surfaceKey, source.id)
                              : undefined
                          }
                          data-state={
                            selectedRowIds.has(source.id)
                              ? "selected"
                              : undefined
                          }
                          className={cn(
                            ROW_TONE_CLASS[tone],
                            source.rowHref &&
                              "cursor-pointer hover:bg-muted/40",
                          )}
                          tabIndex={source.rowHref ? 0 : undefined}
                          onClick={() => navigateToRow(source)}
                          onKeyDown={(event) => {
                            if (
                              source.rowHref &&
                              (event.key === "Enter" || event.key === " ")
                            ) {
                              event.preventDefault();
                              navigateToRow(source);
                            }
                          }}
                        >
                          {showSelection ? (
                            <TableCell>
                              <Checkbox
                                aria-label={`Select row ${source.id}`}
                                checked={selectedRowIds.has(source.id)}
                                onClick={(event) => event.stopPropagation()}
                                onCheckedChange={() =>
                                  toggleRowSelection(source.id)
                                }
                              />
                            </TableCell>
                          ) : null}
                          {row.getVisibleCells().map((cell) => {
                            const column = visibleColumns.find(
                              (entry) => entry.id === cell.column.id,
                            );
                            return (
                              <TableCell
                                key={cell.id}
                                className={columnVisualClass(column)}
                                style={columnVisualStyle(column)}
                                data-trailing-action-state={
                                  cell.column.id === "__trailing"
                                    ? source.trailingAction?.state
                                    : undefined
                                }
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            );
                          })}
                          {showDecisionLedger ? (
                            <TableCell>
                              {source.decisionLedger ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  aria-expanded={expandedLedgerRowIds.has(
                                    source.id,
                                  )}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleLedger(source.id);
                                  }}
                                >
                                  <ClipboardList
                                    className="size-4"
                                    aria-hidden
                                  />
                                  Ledger
                                </Button>
                              ) : null}
                            </TableCell>
                          ) : null}
                        </TableRow>
                        {showDecisionLedger &&
                        source.decisionLedger &&
                        expandedLedgerRowIds.has(source.id) ? (
                          <TableRow>
                            <TableCell colSpan={tableColumnCount}>
                              <DecisionLedgerPanel
                                ledger={source.decisionLedger}
                                label={
                                  decisionLedger?.label ?? "Decision ledger"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </TableBody>
                {summary?.rows.length ? (
                  <TableFooter>
                    {summary.rows.map((summaryRow) => {
                      const source: ListSurfaceRow = {
                        id: summaryRow.id,
                        cells: summaryRow.cells,
                      };
                      return (
                        <TableRow key={summaryRow.id}>
                          {showSelection ? <TableCell /> : null}
                          {visibleColumns.map((column) => (
                            <TableCell
                              key={column.id}
                              className={columnVisualClass(column)}
                              style={columnVisualStyle(column)}
                            >
                              {column.id === visibleColumns[0]?.id ? (
                                <span className="type-body font-medium">
                                  {summaryRow.label}
                                </span>
                              ) : summaryRow.cells[column.id] !== undefined ? (
                                <ListSurfaceCell column={column} row={source} />
                              ) : null}
                            </TableCell>
                          ))}
                          {trailingColumn ? <TableCell /> : null}
                          {showDecisionLedger ? <TableCell /> : null}
                        </TableRow>
                      );
                    })}
                  </TableFooter>
                ) : null}
              </Table>
            </div>
          ) : null}
        </>
      )}
      {pagination ? (
        <div className="flex flex-wrap items-center justify-between gap-2 type-caption">
          <p role="status">
            {pagination.totalCount != null
              ? `${pagination.totalCount} rows`
              : `${rows.length} rows`}
            {pagination.pageSize > 0
              ? ` · page size ${pagination.pageSize}`
              : ""}
            {pagination.hasNextPage || pagination.nextCursor
              ? " · more available"
              : ""}
          </p>
          <div className="flex items-center gap-2">
            {pagination.prevHref ? (
              <Link
                href={pagination.prevHref as Route}
                className="type-label font-medium text-foreground underline-offset-4 hover:underline"
              >
                Previous
              </Link>
            ) : null}
            {pagination.nextHref ? (
              <Link
                href={pagination.nextHref as Route}
                className="type-label font-medium text-foreground underline-offset-4 hover:underline"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn("af-material-opaque @container min-w-0 rounded-section")}
      data-testid={listTestId}
      {...governedDataAttrs}
    >
      {shell}
    </div>
  );
}
