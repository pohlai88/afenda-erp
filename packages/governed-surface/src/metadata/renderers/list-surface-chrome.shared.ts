import type { uiDensity } from "@afenda/ui/design-system";

/** Horizontal inset aligned to @afenda/ui Table cell padding for the active density. */
export function listSurfaceChromeXClass(
  density: keyof typeof uiDensity,
): string {
  return density === "compact"
    ? "px-2.5"
    : "px-[var(--af-table-cell-px)]";
}

export const LIST_SURFACE_CHROME_GROUP_CLASS = "group/list-chrome";

export const LIST_SURFACE_TOOLBAR_ROW_CLASS =
  "flex w-full min-w-0 flex-wrap items-center justify-between gap-2 border-b border-border py-2.5";

export const LIST_SURFACE_FOOTER_ROW_CLASS =
  "flex w-full min-w-0 flex-wrap items-center justify-between gap-2 border-t border-border py-2.5 type-caption text-muted-foreground";

/** Clip boundary for table-only list chrome — uses ERP table-shell token (single radius + border). */
export const LIST_SURFACE_CARD_CHROME_CLASS = "table-shell isolate";

/** Table body host — horizontal scroll lives on table-shell; Table container stays overflow-visible. */
export const LIST_SURFACE_TABLE_VIEWPORT_CLASS =
  "min-w-0 [&_[data-slot=table-container]]:overflow-visible";

/** @deprecated Use listSurfaceChromeXClass(density) — kept for audit static checks. */
export const LIST_SURFACE_CHROME_X_CLASS =
  "px-[var(--af-table-cell-px)] group-data-[density=compact]/list-chrome:px-2.5";
