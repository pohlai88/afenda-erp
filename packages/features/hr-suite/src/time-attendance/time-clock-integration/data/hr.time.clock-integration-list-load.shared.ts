import type { EmptyState } from "@afenda/governed-surface/schemas";

import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
} from "../surface/hr.time.clock-integration-list.shared";

export function buildTimeClockEmbeddedListLoadError(
  sectionTitle: string,
): EmptyState {
  return {
    variant: "error",
    title: `${sectionTitle} unavailable`,
    description:
      "This register could not be loaded. Refresh the page or try again later.",
  };
}

export async function settleTimeClockListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<{ data?: T; loadError?: EmptyState }> {
  try {
    return { data: await input.load() };
  } catch {
    return {
      loadError: buildTimeClockEmbeddedListLoadError(input.sectionTitle),
    };
  }
}

export function normalizeTimeClockWindow<T extends { pageSize: number; totalCount: number; hasNextPage?: boolean; hasMore?: boolean }>(
  window: T,
) {
  return {
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage ?? window.hasMore ?? false,
  };
}

/** Minimal valid list config when loadError is shown. */
export function buildTimeClockListLoadErrorPlaceholder(input: {
  columnsId: string;
  searchParam: string;
  searchLabel: string;
  searchPlaceholder: string;
  surfaceHeaderTitle: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return buildTimeClockOperationalListSurface({
    primaryColumnId: "placeholder",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: input.searchParam,
      label: input.searchLabel,
      placeholder: input.searchPlaceholder,
    }),
    window: {
      pageSize: 25,
      totalCount: 0,
      hasNextPage: false,
    },
    surface: {
      headerTitle: input.surfaceHeaderTitle,
      columnsId: input.columnsId,
      emptyTitle: input.emptyTitle ?? "Register unavailable",
      emptyDescription:
        input.emptyDescription ??
        "This register could not be loaded. Refresh the page and try again.",
    },
    columns: [{ id: "placeholder", header: "—" }],
    rows: [],
  });
}
