import type { CSSProperties } from "react";

import type { ListColumn } from "../../schemas/list-surface.schema";

/** TanStack column id for Pattern C trailing action cells. */
export const LIST_SURFACE_TRAILING_COLUMN_ID = "__trailing";

/** Minimum width for multi-button trailing action columns. */
export const LIST_SURFACE_TRAILING_COLUMN_MIN_WIDTH_PX = 280;

/** Default minimum width when a column omits `minWidth`. */
export const LIST_SURFACE_TABLE_COLUMN_DEFAULT_MIN_WIDTH_PX = 120;

/** Selection checkbox column width budget. */
export const LIST_SURFACE_TABLE_SELECTION_COLUMN_MIN_WIDTH_PX = 40;

/** Decision ledger affordance column width budget. */
export const LIST_SURFACE_TABLE_DECISION_LEDGER_COLUMN_MIN_WIDTH_PX = 96;

/** Horizontal padding budget so the scroll viewport clears card chrome. */
export const LIST_SURFACE_TABLE_SCROLL_PADDING_PX = 48;

export function resolveListSurfaceTableMinWidthPx(input: {
  columns: readonly Pick<ListColumn, "minWidth">[];
  hasTrailingColumn: boolean;
  hasSelection: boolean;
  hasDecisionLedger: boolean;
}): number {
  let total = LIST_SURFACE_TABLE_SCROLL_PADDING_PX;

  if (input.hasSelection) {
    total += LIST_SURFACE_TABLE_SELECTION_COLUMN_MIN_WIDTH_PX;
  }
  if (input.hasDecisionLedger) {
    total += LIST_SURFACE_TABLE_DECISION_LEDGER_COLUMN_MIN_WIDTH_PX;
  }

  for (const column of input.columns) {
    total += column.minWidth ?? LIST_SURFACE_TABLE_COLUMN_DEFAULT_MIN_WIDTH_PX;
  }

  if (input.hasTrailingColumn) {
    total += LIST_SURFACE_TRAILING_COLUMN_MIN_WIDTH_PX;
  }

  return total;
}

export function resolveListSurfaceColumnVisualClass(
  columnId: string,
  column: ListColumn | undefined,
  alignClassName: string,
): string {
  if (columnId === LIST_SURFACE_TRAILING_COLUMN_ID) {
    return `${alignClassName} sticky right-0 z-raised border-l border-border bg-card whitespace-normal align-top text-left`;
  }

  const parts = [
    alignClassName,
    column?.wrap && "whitespace-normal",
    column?.clip && "max-w-[16rem] truncate", // audit-ds: ignore no-arbitrary-value — clip column max-width contract
    column?.pin === "start" && "sticky left-0 z-raised bg-card",
    column?.pin === "end" && "sticky right-0 z-raised bg-card",
  ].filter(Boolean);

  return parts.join(" ");
}

export function resolveListSurfaceColumnVisualStyle(
  columnId: string,
  column: ListColumn | undefined,
): CSSProperties {
  if (columnId === LIST_SURFACE_TRAILING_COLUMN_ID) {
    return { minWidth: LIST_SURFACE_TRAILING_COLUMN_MIN_WIDTH_PX };
  }

  return {
    minWidth: column?.minWidth,
    maxWidth: column?.maxWidth,
  };
}
