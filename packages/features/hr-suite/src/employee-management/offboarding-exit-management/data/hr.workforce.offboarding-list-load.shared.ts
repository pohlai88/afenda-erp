import type { EmptyState } from "@afenda/governed-surface/schemas";

import {
  buildOffboardingListSearchToolbar,
  buildOffboardingOperationalListSurface,
} from "../surface/hr.workforce.offboarding-list.shared";

export async function settleOffboardingListLoad<T>(input: {
  sectionTitle: string;
  load: () => Promise<T>;
}): Promise<
  | { ok: true; value: T }
  | { ok: false; error: EmptyState; sectionTitle: string }
> {
  try {
    return { ok: true, value: await input.load() };
  } catch {
    return {
      ok: false,
      sectionTitle: input.sectionTitle,
      error: {
        variant: "error",
        title: "Could not load offboarding data",
        description: `${input.sectionTitle} is temporarily unavailable.`,
      },
    };
  }
}

export function buildOffboardingListLoadErrorPlaceholder(input: {
  columnsId: string;
  searchParam: string;
  searchLabel: string;
  searchPlaceholder: string;
  surfaceHeaderTitle: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return buildOffboardingOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildOffboardingListSearchToolbar({
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
      emptyTitle: input.emptyTitle,
      emptyDescription: input.emptyDescription,
    },
    columns: [{ id: "employee", header: "—" }],
    rows: [],
  });
}
