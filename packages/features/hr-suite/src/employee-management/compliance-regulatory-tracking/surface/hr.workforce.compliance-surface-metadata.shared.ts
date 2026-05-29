import { hrComplianceExceptionsSurfaceKey } from "./hr.workforce.compliance-exceptions-list.surface";
import { hrComplianceFilingsSurfaceKey } from "./hr.workforce.compliance-filings-list.surface";
import { hrComplianceLaborLawRequirementsSurfaceKey } from "./hr.workforce.compliance-labor-law-requirements-list.surface";
import { hrComplianceObligationsSurfaceKey } from "./hr.workforce.compliance-obligations-list.surface";
import { hrCompliancePolicyAcknowledgementsSurfaceKey } from "./hr.workforce.compliance-policy-acknowledgements-list.surface";
import { hrComplianceRegulatoryCalendarSurfaceKey } from "./hr.workforce.compliance-regulatory-calendar-list.surface";
import { hrComplianceAlertsSurfaceKey } from "./hr.workforce.compliance-alerts-list.surface";
import { hrComplianceSafetyTrainingRequirementsSurfaceKey } from "./hr.workforce.compliance-safety-training-requirements-list.surface";
import { hrComplianceWorkAuthDocumentsSurfaceKey } from "./hr.workforce.compliance-work-auth-documents-list.surface";
import { hrComplianceWorkEligibilitySurfaceKey } from "./hr.workforce.compliance-work-eligibility-list.surface";
import { hrComplianceWorkplaceSafetyRequirementsSurfaceKey } from "./hr.workforce.compliance-workplace-safety-list.surface";
import {
  hrComplianceExceptionsColumnsId,
  hrComplianceFilingsColumnsId,
  hrComplianceLaborLawRequirementsColumnsId,
  hrComplianceObligationsColumnsId,
  hrCompliancePolicyAcknowledgementsColumnsId,
  hrComplianceRegulatoryCalendarColumnsId,
  hrComplianceAlertsColumnsId,
  hrComplianceSafetyTrainingRequirementsColumnsId,
  hrComplianceWorkAuthDocumentsColumnsId,
  hrComplianceWorkEligibilityColumnsId,
  hrComplianceWorkplaceSafetyRequirementsColumnsId,
} from "./hr.workforce.compliance-surface-columns.shared";

/** Canonical Pattern C list surface keys for HR compliance (ARCH-006 registry). Order matches workbench scan priority. */
export const HR_COMPLIANCE_LIST_SURFACE_KEYS = [
  hrComplianceAlertsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
] as const;

export type HrComplianceListSurfaceKey =
  (typeof HR_COMPLIANCE_LIST_SURFACE_KEYS)[number];

export function getHrComplianceListSurfaceKeys(): readonly HrComplianceListSurfaceKey[] {
  return HR_COMPLIANCE_LIST_SURFACE_KEYS;
}

export const HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrComplianceAlertsSurfaceKey]: hrComplianceAlertsColumnsId,
  [hrComplianceObligationsSurfaceKey]: hrComplianceObligationsColumnsId,
  [hrComplianceFilingsSurfaceKey]: hrComplianceFilingsColumnsId,
  [hrComplianceRegulatoryCalendarSurfaceKey]:
    hrComplianceRegulatoryCalendarColumnsId,
  [hrCompliancePolicyAcknowledgementsSurfaceKey]:
    hrCompliancePolicyAcknowledgementsColumnsId,
  [hrComplianceLaborLawRequirementsSurfaceKey]:
    hrComplianceLaborLawRequirementsColumnsId,
  [hrComplianceSafetyTrainingRequirementsSurfaceKey]:
    hrComplianceSafetyTrainingRequirementsColumnsId,
  [hrComplianceWorkplaceSafetyRequirementsSurfaceKey]:
    hrComplianceWorkplaceSafetyRequirementsColumnsId,
  [hrComplianceWorkEligibilitySurfaceKey]: hrComplianceWorkEligibilityColumnsId,
  [hrComplianceWorkAuthDocumentsSurfaceKey]: hrComplianceWorkAuthDocumentsColumnsId,
  [hrComplianceExceptionsSurfaceKey]: hrComplianceExceptionsColumnsId,
} as const;

export {
  hrComplianceAlertsSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
};
