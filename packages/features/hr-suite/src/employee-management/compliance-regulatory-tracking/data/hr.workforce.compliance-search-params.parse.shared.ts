import { hrComplianceRegulatoryCalendarSearchParam } from "../surface/hr.workforce.compliance-regulatory-calendar-list.surface";
import { hrComplianceAlertsSearchParam } from "../surface/hr.workforce.compliance-alerts-list.surface";
import { hrComplianceFilingSearchParam } from "../surface/hr.workforce.compliance-filings-list.surface";
import { hrComplianceExceptionSearchParam } from "../surface/hr.workforce.compliance-exceptions-list.surface";
import { hrComplianceLaborLawSearchParam } from "../surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import { hrComplianceObligationSearchParam } from "../surface/hr.workforce.compliance-obligations-list.surface";
import { hrCompliancePolicyAcknowledgementSearchParam } from "../surface/hr.workforce.compliance-policy-acknowledgements-list.surface";
import { hrComplianceSafetyTrainingSearchParam } from "../surface/hr.workforce.compliance-safety-training-requirements-list.surface";
import { hrComplianceWorkAuthDocumentSearchParam } from "../surface/hr.workforce.compliance-work-auth-documents-list.surface";
import { hrComplianceWorkEligibilitySearchParam } from "../surface/hr.workforce.compliance-work-eligibility-list.surface";
import { hrComplianceWorkplaceSafetySearchParam } from "../surface/hr.workforce.compliance-workplace-safety-list.surface";

export {
  hrComplianceExceptionSearchParam,
  hrComplianceFilingSearchParam,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceAlertsSearchParam,
  hrComplianceLaborLawSearchParam,
  hrComplianceObligationSearchParam,
  hrCompliancePolicyAcknowledgementSearchParam,
  hrComplianceSafetyTrainingSearchParam,
  hrComplianceWorkAuthDocumentSearchParam,
  hrComplianceWorkEligibilitySearchParam,
  hrComplianceWorkplaceSafetySearchParam,
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
  policyAcknowledgementSearch?: string;
  safetyTrainingSearch?: string;
  workplaceSafetySearch?: string;
  workEligibilitySearch?: string;
  workAuthDocumentSearch?: string;
  filingSearch?: string;
  regulatoryCalendarSearch?: string;
  alertsSearch?: string;
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
  const obligationSearch =
    readSearchParam(searchParams, hrComplianceObligationSearchParam) ??
    legacySearch;
  const exceptionSearch =
    readSearchParam(searchParams, hrComplianceExceptionSearchParam) ??
    legacySearch;
  const laborLawSearch =
    readSearchParam(searchParams, hrComplianceLaborLawSearchParam) ??
    legacySearch;
  const policyAcknowledgementSearch =
    readSearchParam(searchParams, hrCompliancePolicyAcknowledgementSearchParam) ??
    legacySearch;
  const safetyTrainingSearch =
    readSearchParam(searchParams, hrComplianceSafetyTrainingSearchParam) ??
    legacySearch;
  const workplaceSafetySearch =
    readSearchParam(searchParams, hrComplianceWorkplaceSafetySearchParam) ??
    legacySearch;
  const workEligibilitySearch =
    readSearchParam(searchParams, hrComplianceWorkEligibilitySearchParam) ??
    legacySearch;
  const workAuthDocumentSearch =
    readSearchParam(searchParams, hrComplianceWorkAuthDocumentSearchParam) ??
    legacySearch;
  const filingSearch =
    readSearchParam(searchParams, hrComplianceFilingSearchParam) ?? legacySearch;
  const regulatoryCalendarSearch =
    readSearchParam(searchParams, hrComplianceRegulatoryCalendarSearchParam) ??
    legacySearch;
  const alertsSearch =
    readSearchParam(searchParams, hrComplianceAlertsSearchParam) ?? legacySearch;

  return {
    obligationSearch,
    exceptionSearch,
    laborLawSearch,
    policyAcknowledgementSearch,
    safetyTrainingSearch,
    workplaceSafetySearch,
    workEligibilitySearch,
    workAuthDocumentSearch,
    filingSearch,
    regulatoryCalendarSearch,
    alertsSearch,
  };
}
