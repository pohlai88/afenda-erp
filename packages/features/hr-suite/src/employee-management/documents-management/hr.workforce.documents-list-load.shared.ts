import type { EmptyState } from "@afenda/governed-surface/schemas";

import {
  buildDocumentsListSearchToolbar,
  buildDocumentsOperationalListSurface,
} from "./hr.workforce.documents-list.shared";

export function buildDocumentsEmbeddedListLoadError(
  sectionTitle: string,
): EmptyState {
  return {
    variant: "error",
    title: `${sectionTitle} unavailable`,
    description:
      "This register could not be loaded. Refresh the page or try again later.",
  };
}

export async function settleDocumentsListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<{ value?: T; loadError?: EmptyState }> {
  try {
    return { value: await input.load() };
  } catch {
    return {
      loadError: buildDocumentsEmbeddedListLoadError(input.sectionTitle),
    };
  }
}

export function buildDocumentsListLoadErrorPlaceholder(input: {
  columnsId: string;
  searchParam: string;
  searchLabel: string;
  searchPlaceholder: string;
  surfaceHeaderTitle: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return buildDocumentsOperationalListSurface({
    primaryColumnId: "placeholder",
    searchToolbar: buildDocumentsListSearchToolbar({
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
