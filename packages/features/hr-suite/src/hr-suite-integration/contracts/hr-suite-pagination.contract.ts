/** Default bounded list window for HR governed lists (Pattern C). */
export const HR_DEFAULT_PAGE_SIZE = 25 as const;

export const HR_MAX_PAGE_SIZE = 100 as const;

export type HrListWindow = {
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNextPage: boolean;
  readonly nextCursor?: string;
};

export type BuildHrListWindowInput = {
  readonly pageSize?: number;
  readonly totalCount: number;
  readonly hasNextPage?: boolean;
  readonly nextCursor?: string | null;
};

export type BuildHrStaticListWindowInput = {
  readonly rowCount: number;
  readonly pageSize?: number;
};

function assertNonNegativeInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
  return value;
}

export function clampHrPageSize(requested: number | undefined): number {
  if (requested === undefined || !Number.isFinite(requested)) {
    return HR_DEFAULT_PAGE_SIZE;
  }
  const size = Math.floor(requested);
  if (size < 1) return HR_DEFAULT_PAGE_SIZE;
  return Math.min(size, HR_MAX_PAGE_SIZE);
}

export function buildHrListWindow(input: BuildHrListWindowInput): HrListWindow {
  const pageSize = clampHrPageSize(input.pageSize);
  const totalCount = assertNonNegativeInteger(
    input.totalCount,
    "HR list total count",
  );
  const nextCursor = input.nextCursor?.trim();

  return {
    pageSize,
    totalCount,
    hasNextPage: input.hasNextPage ?? totalCount > pageSize,
    ...(nextCursor ? { nextCursor } : {}),
  };
}

export function buildHrStaticListWindow(
  input: BuildHrStaticListWindowInput,
): HrListWindow {
  const rowCount = assertNonNegativeInteger(
    input.rowCount,
    "HR list row count",
  );
  return {
    pageSize: input.pageSize
      ? clampHrPageSize(input.pageSize)
      : Math.max(rowCount, 1),
    totalCount: rowCount,
    hasNextPage: false,
  };
}
