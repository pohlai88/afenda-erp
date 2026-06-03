import {
  HR_COMPLIANCE_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY,
  HR_COMPLIANCE_LIST_SURFACE_KEYS,
  hrComplianceAlertsSearchParam,
  hrComplianceExceptionSearchParam,
  hrComplianceFilingSearchParam,
  hrComplianceLaborLawSearchParam,
  hrComplianceStatutorySearchParam,
  hrComplianceObligationSearchParam,
  hrCompliancePolicyAcknowledgementSearchParam,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceSafetyTrainingSearchParam,
  hrComplianceWorkAuthDocumentSearchParam,
  hrComplianceWorkEligibilitySearchParam,
  hrComplianceWorkplaceSafetySearchParam,
  hrComplianceEvidenceLinksSearchParam,
  hrComplianceAuditTrailSearchParam,
  hrComplianceReviewQueueSearchParam,
} from "./hr.workforce.compliance-surface-metadata.shared";

export {
  HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY,
  hrComplianceAlertsSearchParam,
  hrComplianceExceptionSearchParam,
  hrComplianceFilingSearchParam,
  hrComplianceLaborLawSearchParam,
  hrComplianceStatutorySearchParam,
  hrComplianceObligationSearchParam,
  hrCompliancePolicyAcknowledgementSearchParam,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceSafetyTrainingSearchParam,
  hrComplianceWorkAuthDocumentSearchParam,
  hrComplianceWorkEligibilitySearchParam,
  hrComplianceWorkplaceSafetySearchParam,
  hrComplianceEvidenceLinksSearchParam,
  hrComplianceAuditTrailSearchParam,
  hrComplianceReviewQueueSearchParam,
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

export type HrComplianceSearchParams = {
  obligationSearch?: string;
  exceptionSearch?: string;
  laborLawSearch?: string;
  statutorySearch?: string;
  policyAcknowledgementSearch?: string;
  safetyTrainingSearch?: string;
  workplaceSafetySearch?: string;
  workEligibilitySearch?: string;
  workAuthDocumentSearch?: string;
  filingSearch?: string;
  regulatoryCalendarSearch?: string;
  alertsSearch?: string;
  evidenceLinksSearch?: string;
  auditTrailSearch?: string;
  reviewQueueSearch?: string;
};

export function parseHrComplianceSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrComplianceSearchParams {
  if (!searchParams) {
    return {};
  }

  const legacySearch =
    readSearchParam(searchParams, "complianceSearch") ??
    readSearchParam(searchParams, "search");

  const parsed: HrComplianceSearchParams = {};

  for (const surfaceKey of HR_COMPLIANCE_LIST_SURFACE_KEYS) {
    const paramKey = HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
    const modelField =
      HR_COMPLIANCE_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey] as keyof HrComplianceSearchParams;
    parsed[modelField] =
      readSearchParam(searchParams, paramKey) ?? legacySearch;
  }

  return parsed;
}

/** Registry-driven bridge from App Router searchParams to the compliance page model (ARCH-1003). */
export function toHrCompliancePageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canViewSensitive: input.canViewSensitive,
    ...parseHrComplianceSearchParams(input.searchParams),
  };
}
