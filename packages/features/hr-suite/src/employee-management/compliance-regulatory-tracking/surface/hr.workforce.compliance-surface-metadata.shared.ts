import {
  hrComplianceAuditTrailSearchParam,
  hrComplianceAuditTrailSurfaceKey,
} from "./hr.workforce.compliance-audit-trail-list.surface";
import {
  hrComplianceReviewQueueSearchParam,
  hrComplianceReviewQueueSurfaceKey,
} from "./hr.workforce.compliance-review-queue-list.surface";
import {
  hrComplianceAlertsSearchParam,
  hrComplianceAlertsSurfaceKey,
} from "./hr.workforce.compliance-alerts-list.surface";
import {
  hrComplianceExceptionSearchParam,
  hrComplianceExceptionsSurfaceKey,
} from "./hr.workforce.compliance-exceptions-list.surface";
import {
  hrComplianceEvidenceLinksSearchParam,
  hrComplianceEvidenceLinksSurfaceKey,
} from "./hr.workforce.compliance-evidence-links-list.surface";
import {
  hrComplianceFilingSearchParam,
  hrComplianceFilingsSurfaceKey,
} from "./hr.workforce.compliance-filings-list.surface";
import {
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceLaborLawSearchParam,
} from "./hr.workforce.compliance-labor-law-requirements-list.surface";
import {
  hrComplianceStatutoryRequirementsSurfaceKey,
  hrComplianceStatutorySearchParam,
} from "./hr.workforce.compliance-statutory-requirements-list.surface";
import {
  hrComplianceObligationSearchParam,
  hrComplianceObligationsSurfaceKey,
} from "./hr.workforce.compliance-obligations-list.surface";
import {
  hrCompliancePolicyAcknowledgementSearchParam,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
} from "./hr.workforce.compliance-policy-acknowledgements-list.surface";
import {
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceRegulatoryCalendarSurfaceKey,
} from "./hr.workforce.compliance-regulatory-calendar-list.surface";
import {
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceSafetyTrainingSearchParam,
} from "./hr.workforce.compliance-safety-training-requirements-list.surface";
import {
  hrComplianceWorkAuthDocumentSearchParam,
  hrComplianceWorkAuthDocumentsSurfaceKey,
} from "./hr.workforce.compliance-work-auth-documents-list.surface";
import {
  hrComplianceWorkEligibilitySearchParam,
  hrComplianceWorkEligibilitySurfaceKey,
} from "./hr.workforce.compliance-work-eligibility-list.surface";
import {
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceWorkplaceSafetySearchParam,
} from "./hr.workforce.compliance-workplace-safety-list.surface";
import {
  hrComplianceAlertsColumnsId,
  hrComplianceEvidenceLinksColumnsId,
  hrComplianceExceptionsColumnsId,
  hrComplianceFilingsColumnsId,
  hrComplianceLaborLawRequirementsColumnsId,
  hrComplianceStatutoryRequirementsColumnsId,
  hrComplianceObligationsColumnsId,
  hrCompliancePolicyAcknowledgementsColumnsId,
  hrComplianceRegulatoryCalendarColumnsId,
  hrComplianceSafetyTrainingRequirementsColumnsId,
  hrComplianceWorkAuthDocumentsColumnsId,
  hrComplianceWorkEligibilityColumnsId,
  hrComplianceWorkplaceSafetyRequirementsColumnsId,
  hrComplianceAuditTrailColumnsId,
  hrComplianceReviewQueueColumnsId,
} from "./hr.workforce.compliance-surface-columns.shared";

/** Canonical Pattern C list surface keys for HR compliance (ARCH-006 registry). Order matches workbench scan priority. */
export const HR_COMPLIANCE_LIST_SURFACE_KEYS = [
  hrComplianceAlertsSurfaceKey,
  hrComplianceReviewQueueSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceStatutoryRequirementsSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceEvidenceLinksSurfaceKey,
  hrComplianceAuditTrailSurfaceKey,
] as const;

export type HrComplianceListSurfaceKey =
  (typeof HR_COMPLIANCE_LIST_SURFACE_KEYS)[number];

export function getHrComplianceListSurfaceKeys(): readonly HrComplianceListSurfaceKey[] {
  return HR_COMPLIANCE_LIST_SURFACE_KEYS;
}

export const HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrComplianceAlertsSurfaceKey]: hrComplianceAlertsColumnsId,
  [hrComplianceReviewQueueSurfaceKey]: hrComplianceReviewQueueColumnsId,
  [hrComplianceObligationsSurfaceKey]: hrComplianceObligationsColumnsId,
  [hrComplianceFilingsSurfaceKey]: hrComplianceFilingsColumnsId,
  [hrComplianceRegulatoryCalendarSurfaceKey]:
    hrComplianceRegulatoryCalendarColumnsId,
  [hrCompliancePolicyAcknowledgementsSurfaceKey]:
    hrCompliancePolicyAcknowledgementsColumnsId,
  [hrComplianceLaborLawRequirementsSurfaceKey]:
    hrComplianceLaborLawRequirementsColumnsId,
  [hrComplianceStatutoryRequirementsSurfaceKey]:
    hrComplianceStatutoryRequirementsColumnsId,
  [hrComplianceSafetyTrainingRequirementsSurfaceKey]:
    hrComplianceSafetyTrainingRequirementsColumnsId,
  [hrComplianceWorkplaceSafetyRequirementsSurfaceKey]:
    hrComplianceWorkplaceSafetyRequirementsColumnsId,
  [hrComplianceWorkEligibilitySurfaceKey]: hrComplianceWorkEligibilityColumnsId,
  [hrComplianceWorkAuthDocumentsSurfaceKey]: hrComplianceWorkAuthDocumentsColumnsId,
  [hrComplianceExceptionsSurfaceKey]: hrComplianceExceptionsColumnsId,
  [hrComplianceEvidenceLinksSurfaceKey]: hrComplianceEvidenceLinksColumnsId,
  [hrComplianceAuditTrailSurfaceKey]: hrComplianceAuditTrailColumnsId,
} as const;

/** Per-list App Router search param keys (ARCH-006 toolbar registry). */
export const HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrComplianceAlertsSurfaceKey]: hrComplianceAlertsSearchParam,
  [hrComplianceReviewQueueSurfaceKey]: hrComplianceReviewQueueSearchParam,
  [hrComplianceObligationsSurfaceKey]: hrComplianceObligationSearchParam,
  [hrComplianceFilingsSurfaceKey]: hrComplianceFilingSearchParam,
  [hrComplianceRegulatoryCalendarSurfaceKey]:
    hrComplianceRegulatoryCalendarSearchParam,
  [hrCompliancePolicyAcknowledgementsSurfaceKey]:
    hrCompliancePolicyAcknowledgementSearchParam,
  [hrComplianceLaborLawRequirementsSurfaceKey]: hrComplianceLaborLawSearchParam,
  [hrComplianceStatutoryRequirementsSurfaceKey]: hrComplianceStatutorySearchParam,
  [hrComplianceSafetyTrainingRequirementsSurfaceKey]:
    hrComplianceSafetyTrainingSearchParam,
  [hrComplianceWorkplaceSafetyRequirementsSurfaceKey]:
    hrComplianceWorkplaceSafetySearchParam,
  [hrComplianceWorkEligibilitySurfaceKey]: hrComplianceWorkEligibilitySearchParam,
  [hrComplianceWorkAuthDocumentsSurfaceKey]: hrComplianceWorkAuthDocumentSearchParam,
  [hrComplianceExceptionsSurfaceKey]: hrComplianceExceptionSearchParam,
  [hrComplianceEvidenceLinksSurfaceKey]: hrComplianceEvidenceLinksSearchParam,
  [hrComplianceAuditTrailSurfaceKey]: hrComplianceAuditTrailSearchParam,
} as const;

/** Pattern C workbench lists without trailing columns (ARCH-006). */
export const HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS = new Set<
  HrComplianceListSurfaceKey
>([
  hrComplianceAlertsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceAuditTrailSurfaceKey,
]);

/** Maps App Router search param keys to page-model search field names. */
export const HR_COMPLIANCE_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrComplianceAlertsSearchParam]: "alertsSearch",
  [hrComplianceReviewQueueSearchParam]: "reviewQueueSearch",
  [hrComplianceObligationSearchParam]: "obligationSearch",
  [hrComplianceFilingSearchParam]: "filingSearch",
  [hrComplianceRegulatoryCalendarSearchParam]: "regulatoryCalendarSearch",
  [hrCompliancePolicyAcknowledgementSearchParam]: "policyAcknowledgementSearch",
  [hrComplianceLaborLawSearchParam]: "laborLawSearch",
  [hrComplianceStatutorySearchParam]: "statutorySearch",
  [hrComplianceSafetyTrainingSearchParam]: "safetyTrainingSearch",
  [hrComplianceWorkplaceSafetySearchParam]: "workplaceSafetySearch",
  [hrComplianceWorkEligibilitySearchParam]: "workEligibilitySearch",
  [hrComplianceWorkAuthDocumentSearchParam]: "workAuthDocumentSearch",
  [hrComplianceExceptionSearchParam]: "exceptionSearch",
  [hrComplianceEvidenceLinksSearchParam]: "evidenceLinksSearch",
  [hrComplianceAuditTrailSearchParam]: "auditTrailSearch",
} as const satisfies Record<
  (typeof HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY)[HrComplianceListSurfaceKey],
  string
>;

export {
  hrComplianceAuditTrailSearchParam,
  hrComplianceAuditTrailSurfaceKey,
  hrComplianceReviewQueueSearchParam,
  hrComplianceReviewQueueSurfaceKey,
  hrComplianceAlertsSearchParam,
  hrComplianceAlertsSurfaceKey,
  hrComplianceEvidenceLinksSearchParam,
  hrComplianceEvidenceLinksSurfaceKey,
  hrComplianceExceptionSearchParam,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingSearchParam,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceLaborLawSearchParam,
  hrComplianceStatutoryRequirementsSurfaceKey,
  hrComplianceStatutorySearchParam,
  hrComplianceObligationSearchParam,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementSearchParam,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceSafetyTrainingSearchParam,
  hrComplianceWorkAuthDocumentSearchParam,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySearchParam,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceWorkplaceSafetySearchParam,
};
