import type {
  ListSurfaceToolbar,
  ListSurfaceToolbarFilter,
  ListSurfaceToolbarSortOption,
} from "@afenda/governed-surface";

export function buildSystemAdminStaticPagination(
  totalCount: number,
  pageSize = totalCount,
) {
  return {
    pageSize: Math.max(1, pageSize),
    totalCount,
    hasNextPage: false,
  };
}

export function buildSystemAdminListToolbar(input: {
  scope: string;
  searchPlaceholder: string;
  sortColumn: string;
  filters?: readonly ListSurfaceToolbarFilter[];
  sortOptions?: readonly ListSurfaceToolbarSortOption[];
}): ListSurfaceToolbar {
  const searchParam = `${input.scope}Q`;
  const sortParam = `${input.scope}Sort`;
  const sortOptions = input.sortOptions ?? [
    {
      label: "Ascending",
      value: "asc",
      columnId: input.sortColumn,
      direction: "asc" as const,
    },
    {
      label: "Descending",
      value: "desc",
      columnId: input.sortColumn,
      direction: "desc" as const,
    },
  ];

  return {
    search: {
      param: searchParam,
      label: "Search",
      placeholder: input.searchPlaceholder,
    },
    filters: input.filters ? [...input.filters] : undefined,
    sort: {
      label: "Sort",
      param: sortParam,
      options: [...sortOptions],
    },
    densityToggle: true,
    columnPicker: true,
    resetParams: [
      searchParam,
      sortParam,
      ...(input.filters ?? []).map((filter) => filter.param),
    ],
  };
}
