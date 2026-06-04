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
import { GovernedEmpty } from "./gov-governed-empty";
import {
  buildGovernedListSurfaceDataAttributes,
  governedListRowTestId,
  governedListSurfaceTestId,
} from "./list-surface-identity.shared";
import type { EmptyState, ListColumn } from "./gov-list-surface-schema";
import type {
  ListSurfaceRendererDataNature,
  ListSurfacePresentation,
  ListSurfaceRow,
  ListSurfaceRowDecisionLedger,
  ListSurfaceRowTone,
} from "./gov-list-surface-renderer-schema";
import type { ListSurfaceToolbar } from "./gov-list-surface-toolbar-schema";
import type { GovernedServerActionHandler } from "./gov-server-actions-shared";
import type { GovernedListTrailingCellContext } from "./gov-list-trailing-cell-context-schema";
import type { uiDensity } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import {
  resolveListSurfaceColumnVisualClass,
  resolveListSurfaceColumnVisualStyle,
  resolveListSurfaceTableMinWidthPx,
} from "./gov-list-surface-table-layout-shared";
import { buildListSurfaceColumnDefs } from "./gov-list-surface-tanstack-shared";
import { ListSurfaceCell } from "./gov-list-surface-cell-client";
import { ListSurfaceToolbarClient } from "./gov-list-surface-toolbar-client";
import {
  LIST_SURFACE_CARD_CHROME_CLASS,
  LIST_SURFACE_CHROME_GROUP_CLASS,
  LIST_SURFACE_FOOTER_ROW_CLASS,
  LIST_SURFACE_TABLE_VIEWPORT_CLASS,
  LIST_SURFACE_TOOLBAR_ROW_CLASS,
  listSurfaceChromeXClass,
} from "./gov-list-surface-chrome-shared";

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

function listSurfaceColumnClass(
  columnId: string,
  column: ListColumn | undefined,
): string {
  return cn(
    resolveListSurfaceColumnVisualClass(columnId, column, alignClass(column?.align)),
  );
}

function listSurfaceColumnStyle(
  columnId: string,
  column: ListColumn | undefined,
): CSSProperties {
  return resolveListSurfaceColumnVisualStyle(columnId, column);
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
    <Card className="surface-inset border-0 shadow-none">
      <CardContent className="flex flex-col gap-2 p-0 type-body">
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
      </CardContent>
    </Card>
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
  sectionKey?: string;
  componentKey?: string;
  columnsId?: string;
  /** Accessible name for the data table (typically the list surface title). */
  tableLabel?: string;
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
  bulkActionHandlers?: Record<string, GovernedServerActionHandler<FormData, void>>;
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
  sectionKey,
  componentKey,
  columnsId,
  tableLabel,
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
  bulkActionHandlers,
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
  const chromeXClass = listSurfaceChromeXClass(density);

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
    sectionKey,
    componentKey,
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
  const selectableRowIds = useMemo(
    () =>
      rows
        .filter((row) => !row.selectionDisabledReason)
        .map((row) => row.id),
    [rows],
  );
  const selectableRowIdSet = useMemo(
    () => new Set(selectableRowIds),
    [selectableRowIds],
  );
  const selectedEligibleRowIds = useMemo(
    () =>
      Array.from(selectedRowIds).filter((rowId) =>
        selectableRowIdSet.has(rowId),
      ),
    [selectableRowIdSet, selectedRowIds],
  );
  const showDecisionLedger =
    decisionLedger?.enabled !== false &&
    rows.some((row) => row.decisionLedger !== undefined);
  const tableColumnCount =
    visibleColumns.length +
    (trailingColumn ? 1 : 0) +
    (showSelection ? 1 : 0) +
    (showDecisionLedger ? 1 : 0);
  const tableMinWidthPx = resolveListSurfaceTableMinWidthPx({
    columns: visibleColumns,
    hasTrailingColumn: Boolean(trailingColumn),
    hasSelection: showSelection,
    hasDecisionLedger: showDecisionLedger,
  });

  const navigateToRow = (row: ListSurfaceRow) => {
    if (row.rowHref) {
      router.push(row.rowHref as Route);
    }
  };

  const toggleRowSelection = (rowId: string) => {
    if (!selectableRowIdSet.has(rowId)) {
      return;
    }

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
      if (
        selectableRowIds.length > 0 &&
        selectableRowIds.every((rowId) => prev.has(rowId))
      ) {
        return new Set();
      }
      return new Set(selectableRowIds);
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
    <div
      className={cn(LIST_SURFACE_CHROME_GROUP_CLASS, LIST_SURFACE_CARD_CHROME_CLASS)}
      data-density={density}
    >
      {toolbar || tableLabel ? (
        <div
          className={cn(
            LIST_SURFACE_TOOLBAR_ROW_CLASS,
            chromeXClass,
          )}
        >
          {tableLabel ? (
            <p className="type-label font-medium text-foreground">{tableLabel}</p>
          ) : (
            <span aria-hidden className="min-w-0 shrink-0" />
          )}
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
            selectedCount={selectedEligibleRowIds.length}
            selectedRowIds={selectedEligibleRowIds}
            selectionLabel={selection?.bulkScopeLabel ?? selection?.label}
            bulkActionHandlers={bulkActionHandlers}
          />
        </div>
      ) : null}
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
                      "border-border shadow-elevation-1",
                      ROW_TONE_CLASS[tone],
                      source.rowHref &&
                        "cursor-pointer transition-colors hover:bg-muted/40 hover:shadow-elevation-2",
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
                LIST_SURFACE_TABLE_VIEWPORT_CLASS,
                tableVisibilityClass,
                useVirtual && "max-h-[32rem] overflow-y-auto", // audit-ds: ignore no-arbitrary-value — virtual scroll viewport height contract
                stickyHeader && "relative",
              )}
            >
              <Table
                density={density}
                containerClassName="overflow-visible"
                aria-label={tableLabel ?? "Data table"}
                className="w-max min-w-full text-left type-body"
                style={{ minWidth: tableMinWidthPx }}
              >
                <TableHeader
                  className={cn(
                    stickyHeader &&
                      "sticky top-0 z-raised border-b border-border bg-card",
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
                                selectableRowIds.length > 0 &&
                                selectableRowIds.every((rowId) =>
                                  selectedRowIds.has(rowId),
                                )
                              }
                              disabled={selectableRowIds.length === 0}
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
                            className={listSurfaceColumnClass(
                              header.column.id,
                              column,
                            )}
                            style={listSurfaceColumnStyle(
                              header.column.id,
                              column,
                            )}
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
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="type-label inline-flex h-auto items-center gap-1 px-1 py-0 font-medium hover:text-foreground"
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </Button>
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
                                disabled={Boolean(
                                  source.selectionDisabledReason,
                                )}
                                title={source.selectionDisabledReason}
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
                                className={listSurfaceColumnClass(
                                  cell.column.id,
                                  column,
                                )}
                                style={listSurfaceColumnStyle(
                                  cell.column.id,
                                  column,
                                )}
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
                              className={listSurfaceColumnClass(column.id, column)}
                              style={listSurfaceColumnStyle(column.id, column)}
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
        <div
          className={cn(
            LIST_SURFACE_FOOTER_ROW_CLASS,
            chromeXClass,
          )}
        >
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
      className="@container min-w-0"
      data-testid={listTestId}
      {...governedDataAttrs}
    >
      {shell}
    </div>
  );
}
