export const hrExpenseClaimsSearchParam = "expenseClaimsSearch";
export const hrExpenseReportsSearchParam = "expenseReportsSearch";
export const hrExpenseAuditTrailSearchParam = "expenseAuditSearch";

export const hrExpenseClaimsSurfaceKey = "expense-claims";
export const hrExpenseReportsSurfaceKey = "expense-reports";
export const hrExpenseAuditTrailSurfaceKey = "expense-audit-trail";

export const HR_EXPENSE_LIST_SURFACE_KEYS = [
  hrExpenseClaimsSurfaceKey,
  hrExpenseReportsSurfaceKey,
  hrExpenseAuditTrailSurfaceKey,
] as const;

export type HrExpenseListSurfaceKey =
  (typeof HR_EXPENSE_LIST_SURFACE_KEYS)[number];

export const HR_EXPENSE_LIST_SEARCH_PARAMS_BY_KEY: Record<
  HrExpenseListSurfaceKey,
  string
> = {
  [hrExpenseClaimsSurfaceKey]: hrExpenseClaimsSearchParam,
  [hrExpenseReportsSurfaceKey]: hrExpenseReportsSearchParam,
  [hrExpenseAuditTrailSurfaceKey]: hrExpenseAuditTrailSearchParam,
};

export type HrExpenseSearchParams = {
  claimsSearch?: string;
  reportsSearch?: string;
  auditTrailSearch?: string;
};

export const HR_EXPENSE_LIST_SEARCH_PARAM_MODEL_FIELDS: Record<
  string,
  keyof HrExpenseSearchParams
> = {
  [hrExpenseClaimsSearchParam]: "claimsSearch",
  [hrExpenseReportsSearchParam]: "reportsSearch",
  [hrExpenseAuditTrailSearchParam]: "auditTrailSearch",
};

export const HR_EXPENSE_WORKBENCH_READ_ONLY_SURFACE_KEYS = new Set<
  HrExpenseListSurfaceKey
>([hrExpenseAuditTrailSurfaceKey, hrExpenseReportsSurfaceKey]);

export function getHrExpenseListSurfaceKeys(): readonly HrExpenseListSurfaceKey[] {
  return HR_EXPENSE_LIST_SURFACE_KEYS;
}

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry.trim().length > 0);
    return first?.trim();
  }
  return undefined;
}

export function parseHrExpenseSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrExpenseSearchParams {
  if (!searchParams) {
    return {};
  }

  const parsed: HrExpenseSearchParams = {};
  for (const [paramKey, modelField] of Object.entries(
    HR_EXPENSE_LIST_SEARCH_PARAM_MODEL_FIELDS,
  )) {
    parsed[modelField] = readSearchParam(searchParams, paramKey);
  }
  return parsed;
}

export function toHrExpensePageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  canApprove: boolean;
  actorUserId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrExpenseSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    actorUserId: input.actorUserId,
    claimsSearch: parsed.claimsSearch,
    reportsSearch: parsed.reportsSearch,
    auditTrailSearch: parsed.auditTrailSearch,
  };
}
