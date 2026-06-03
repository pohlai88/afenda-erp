import {
  HR_LIFECYCLE_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_LIFECYCLE_LIST_SEARCH_PARAMS_BY_KEY,
  HR_LIFECYCLE_LIST_SURFACE_KEYS,
} from "./hr.workforce.lifecycle-surface-metadata.shared";
import {
  hrLifecycleEmploymentStatusFilterParam,
  hrLifecycleOverviewSearchParam,
} from "./hr.workforce.lifecycle-overview-list.surface";
import { hrLifecyclePendingTransitionsSearchParam } from "./hr.workforce.lifecycle-pending-transitions-list.surface";
import { hrLifecycleEmploymentStatusSchema } from "./hr.workforce.lifecycle-employment-status.schema";

export {
  HR_LIFECYCLE_LIST_SEARCH_PARAMS_BY_KEY,
  hrLifecycleOverviewSearchParam,
  hrLifecycleEmploymentStatusFilterParam,
  hrLifecyclePendingTransitionsSearchParam,
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

export type HrLifecycleSearchParams = {
  pendingTransitionsSearch?: string;
  probationDueSearch?: string;
  contractReviewsSearch?: string;
  onboardingCasesSearch?: string;
  noticePeriodSearch?: string;
  offboardingCasesSearch?: string;
  overviewSearch?: string;
  auditTrailSearch?: string;
  employmentStatusFilter?: string;
};

export function parseHrLifecycleSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrLifecycleSearchParams {
  if (!searchParams) {
    return {};
  }

  const legacySearch =
    readSearchParam(searchParams, "lifecycleSearch") ??
    readSearchParam(searchParams, "search");

  const parsed: HrLifecycleSearchParams = {};

  for (const surfaceKey of HR_LIFECYCLE_LIST_SURFACE_KEYS) {
    const paramKey = HR_LIFECYCLE_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
    const modelField =
      HR_LIFECYCLE_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey] as keyof HrLifecycleSearchParams;
    parsed[modelField] =
      readSearchParam(searchParams, paramKey) ?? legacySearch;
  }

  const statusRaw = readSearchParam(
    searchParams,
    hrLifecycleEmploymentStatusFilterParam,
  );
  if (statusRaw) {
    const status = hrLifecycleEmploymentStatusSchema.safeParse(statusRaw);
    if (status.success) {
      parsed.employmentStatusFilter = status.data;
    }
  }

  return parsed;
}

export function toHrLifecyclePageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrLifecycleSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    pendingTransitionsSearch: parsed.pendingTransitionsSearch,
    probationDueSearch: parsed.probationDueSearch,
    contractReviewsSearch: parsed.contractReviewsSearch,
    onboardingCasesSearch: parsed.onboardingCasesSearch,
    noticePeriodSearch: parsed.noticePeriodSearch,
    offboardingCasesSearch: parsed.offboardingCasesSearch,
    overviewSearch: parsed.overviewSearch,
    auditTrailSearch: parsed.auditTrailSearch,
    employmentStatusFilter: parsed.employmentStatusFilter,
  };
}
