import type { EmptyState } from "@afenda/governed-surface/schemas";

import {
  buildLifecycleListSearchToolbar,
  buildLifecycleOperationalListSurface,
} from "./hr.workforce.lifecycle-list.shared";

export function buildLifecycleEmbeddedListLoadError(
  sectionTitle: string,
): EmptyState {
  return {
    variant: "error",
    title: `${sectionTitle} unavailable`,
    description:
      "This register could not be loaded. Refresh the page or try again later.",
  };
}

export async function settleLifecycleListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<{ value?: T; loadError?: EmptyState }> {
  try {
    return { value: await input.load() };
  } catch {
    return {
      loadError: buildLifecycleEmbeddedListLoadError(input.sectionTitle),
    };
  }
}

export function buildLifecycleListLoadErrorPlaceholder(input: {
  columnsId: string;
  searchParam: string;
  searchLabel: string;
  searchPlaceholder: string;
  surfaceHeaderTitle: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return buildLifecycleOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLifecycleListSearchToolbar({
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
    columns: [{ id: "employee", header: "—" }],
    rows: [],
  });
}
