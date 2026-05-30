export const hrBenefitsPlansSearchParam = "benefitsPlansSearch";
export const hrBenefitsEligibilityRulesSearchParam = "benefitsEligibilitySearch";
export const hrBenefitsOpenEnrollmentSearchParam = "benefitsOpenEnrollmentSearch";
export const hrBenefitsEnrollmentsSearchParam = "benefitsEnrollmentsSearch";
export const hrBenefitsProvidersSearchParam = "benefitsProvidersSearch";
export const hrBenefitsAuditTrailSearchParam = "benefitsAuditTrailSearch";

export const hrBenefitsPlansSurfaceKey = "hr.payroll.benefits.plans.list";
export const hrBenefitsEligibilityRulesSurfaceKey =
  "hr.payroll.benefits.eligibility-rules.list";
export const hrBenefitsOpenEnrollmentSurfaceKey =
  "hr.payroll.benefits.open-enrollment.list";
export const hrBenefitsEnrollmentsSurfaceKey =
  "hr.payroll.benefits.enrollments.list";
export const hrBenefitsProvidersSurfaceKey = "hr.payroll.benefits.providers.list";
export const hrBenefitsAuditTrailSurfaceKey =
  "hr.payroll.benefits.audit-trail.list";

export const HR_BENEFITS_LIST_SURFACE_KEYS = [
  hrBenefitsPlansSurfaceKey,
  hrBenefitsEligibilityRulesSurfaceKey,
  hrBenefitsOpenEnrollmentSurfaceKey,
  hrBenefitsEnrollmentsSurfaceKey,
  hrBenefitsAuditTrailSurfaceKey,
] as const;

export type HrBenefitsListSurfaceKey =
  (typeof HR_BENEFITS_LIST_SURFACE_KEYS)[number];

export const HR_BENEFITS_LIST_SEARCH_PARAMS_BY_KEY: Record<
  HrBenefitsListSurfaceKey,
  string
> = {
  [hrBenefitsPlansSurfaceKey]: hrBenefitsPlansSearchParam,
  [hrBenefitsEligibilityRulesSurfaceKey]: hrBenefitsEligibilityRulesSearchParam,
  [hrBenefitsOpenEnrollmentSurfaceKey]: hrBenefitsOpenEnrollmentSearchParam,
  [hrBenefitsEnrollmentsSurfaceKey]: hrBenefitsEnrollmentsSearchParam,
  [hrBenefitsAuditTrailSurfaceKey]: hrBenefitsAuditTrailSearchParam,
};

export type HrBenefitsSearchParams = {
  plansSearch?: string;
  eligibilityRulesSearch?: string;
  openEnrollmentSearch?: string;
  enrollmentsSearch?: string;
  auditTrailSearch?: string;
};

export const HR_BENEFITS_LIST_SEARCH_PARAM_MODEL_FIELDS: Record<
  string,
  keyof HrBenefitsSearchParams
> = {
  [hrBenefitsPlansSearchParam]: "plansSearch",
  [hrBenefitsEligibilityRulesSearchParam]: "eligibilityRulesSearch",
  [hrBenefitsOpenEnrollmentSearchParam]: "openEnrollmentSearch",
  [hrBenefitsEnrollmentsSearchParam]: "enrollmentsSearch",
  [hrBenefitsAuditTrailSearchParam]: "auditTrailSearch",
};

export const HR_BENEFITS_WORKBENCH_READ_ONLY_SURFACE_KEYS = new Set<
  HrBenefitsListSurfaceKey
>([hrBenefitsAuditTrailSurfaceKey]);

export function getHrBenefitsListSurfaceKeys(): readonly HrBenefitsListSurfaceKey[] {
  return HR_BENEFITS_LIST_SURFACE_KEYS;
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

export function parseHrBenefitsSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrBenefitsSearchParams {
  if (!searchParams) {
    return {};
  }

  const parsed: HrBenefitsSearchParams = {};
  for (const [paramKey, modelField] of Object.entries(
    HR_BENEFITS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  )) {
    parsed[modelField] = readSearchParam(searchParams, paramKey);
  }
  return parsed;
}

export function toHrBenefitsPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    ...parseHrBenefitsSearchParams(input.searchParams),
  };
}

export const HR_BENEFITS_LIST_SURFACE_COLUMNS_BY_KEY: Record<
  HrBenefitsListSurfaceKey,
  string
> = {
  [hrBenefitsPlansSurfaceKey]: "hr.payroll.benefits.plans",
  [hrBenefitsEligibilityRulesSurfaceKey]: "hr.payroll.benefits.eligibility-rules",
  [hrBenefitsOpenEnrollmentSurfaceKey]: "hr.payroll.benefits.open-enrollment",
  [hrBenefitsEnrollmentsSurfaceKey]: "hr.payroll.benefits.enrollments",
  [hrBenefitsAuditTrailSurfaceKey]: "hr.payroll.benefits.audit-trail",
};
