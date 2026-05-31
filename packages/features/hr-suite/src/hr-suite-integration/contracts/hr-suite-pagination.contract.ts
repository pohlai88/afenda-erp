/** Default bounded list window for HR governed lists (Pattern C). */
export const HR_DEFAULT_PAGE_SIZE = 25 as const;

export const HR_MAX_PAGE_SIZE = 100 as const;

export type HrListWindow = {
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNextPage: boolean;
  readonly nextCursor?: string;
};

export function clampHrPageSize(requested: number | undefined): number {
  if (requested === undefined || !Number.isFinite(requested)) {
    return HR_DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(requested);
  if (size < 1) return HR_DEFAULT_PAGE_SIZE;
  return Math.min(size, HR_MAX_PAGE_SIZE);
}
