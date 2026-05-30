import {
  HR_OFFBOARDING_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_OFFBOARDING_LIST_SEARCH_PARAMS_BY_KEY,
  HR_OFFBOARDING_LIST_SURFACE_KEYS,
  hrOffboardingExitTypeFilterParam,
} from "../surface/hr.workforce.offboarding-surface-metadata.shared";

export type HrOffboardingSearchParams = {
  casesSearch?: string;
  clearanceSearch?: string;
  approvalsSearch?: string;
  assetsSearch?: string;
  settlementSearch?: string;
  overdueSearch?: string;
  auditTrailSearch?: string;
  exitTypeFilter?: string;
};

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

export function parseHrOffboardingSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrOffboardingSearchParams {
  const parsed = searchParams ?? {};
  return {
    casesSearch: readSearchParam(parsed, "offboardingCasesSearch"),
    clearanceSearch: readSearchParam(parsed, "offboardingClearanceSearch"),
    approvalsSearch: readSearchParam(parsed, "offboardingApprovalsSearch"),
    assetsSearch: readSearchParam(parsed, "offboardingAssetsSearch"),
    settlementSearch: readSearchParam(parsed, "offboardingSettlementSearch"),
    overdueSearch: readSearchParam(parsed, "offboardingOverdueSearch"),
    auditTrailSearch: readSearchParam(parsed, "offboardingAuditTrailSearch"),
    exitTypeFilter: readSearchParam(parsed, hrOffboardingExitTypeFilterParam),
  };
}

export function toHrOffboardingPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    ...parseHrOffboardingSearchParams(input.searchParams),
  };
}

export {
  HR_OFFBOARDING_LIST_SURFACE_KEYS,
  HR_OFFBOARDING_LIST_SEARCH_PARAMS_BY_KEY,
  HR_OFFBOARDING_LIST_SEARCH_PARAM_MODEL_FIELDS,
};

export {
  hrOffboardingCasesSearchParam,
} from "../surface/hr.workforce.offboarding-cases-list.surface";
export {
  hrOffboardingClearanceSearchParam,
} from "../surface/hr.workforce.offboarding-clearance-list.surface";
export {
  hrOffboardingApprovalsSearchParam,
} from "../surface/hr.workforce.offboarding-approvals-list.surface";
export {
  hrOffboardingAssetsSearchParam,
} from "../surface/hr.workforce.offboarding-assets-list.surface";
export {
  hrOffboardingSettlementSearchParam,
} from "../surface/hr.workforce.offboarding-settlement-list.surface";
export {
  hrOffboardingOverdueSearchParam,
} from "../surface/hr.workforce.offboarding-overdue-list.surface";
export {
  hrOffboardingAuditTrailSearchParam,
} from "../surface/hr.workforce.offboarding-audit-trail-list.surface";

export type { HrOffboardingListSurfaceKey } from "../surface/hr.workforce.offboarding-surface-metadata.shared";
