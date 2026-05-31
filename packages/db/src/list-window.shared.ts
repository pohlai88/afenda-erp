/** Shared list-window pagination helpers for @afenda/db query modules. */
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export function clampPageSize(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(limit);
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

export function buildPaginatedWindow<T>(input: {
  rows: readonly T[];
  pageSize: number;
  offset: number;
  totalCount: number;
}) {
  return {
    rows: input.rows,
    pageSize: input.pageSize,
    totalCount: input.totalCount,
    hasNextPage: input.offset + input.rows.length < input.totalCount,
  };
}
