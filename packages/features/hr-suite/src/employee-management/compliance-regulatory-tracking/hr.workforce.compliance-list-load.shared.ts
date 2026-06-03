import type { EmptyState } from "@afenda/governed-surface/schemas";

import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
} from "./hr.workforce.compliance-list.shared";

export function buildComplianceEmbeddedListLoadError(
  sectionTitle: string,
): EmptyState {
  return {
    variant: "error",
    title: `${sectionTitle} unavailable`,
    description:
      "This register could not be loaded. Refresh the page or try again later.",
  };
}

export async function settleComplianceListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<{ value?: T; loadError?: EmptyState }> {
  try {
    return { value: await input.load() };
  } catch {
    return {
      loadError: buildComplianceEmbeddedListLoadError(input.sectionTitle),
    };
  }
}

/** Minimal valid list config when `loadError` is shown (never rendered as empty state). */
export function buildComplianceListLoadErrorPlaceholder(input: {
  columnsId: string;
  searchParam: string;
  searchLabel: string;
  searchPlaceholder: string;
  surfaceHeaderTitle: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return buildComplianceOperationalListSurface({
    primaryColumnId: "placeholder",
    searchToolbar: buildComplianceListSearchToolbar({
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
