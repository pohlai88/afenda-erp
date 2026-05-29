import "server-only"

export {
  resolveFhcSurfaceAccess,
  type FhcSurfaceAccess,
} from "./data/fhc-access.server"

export {
  getFoodHandlingEligibilityForScheduling,
  getFhcMandatoryTrainingForCompliance,
  listFhcLearningRequirementsForTraining,
  type FhcLearningRequirementRow,
  type FhcMandatoryTrainingCompletionRow,
  type FoodHandlingEligibilityForScheduling,
} from "./data/fhc-integration.server"

export {
  listFhcOutletsForOrg,
  listFhcRequirementRulesForOrg,
  listFhcEmployeeObligationsForOrg,
} from "./data/fhc.queries.server"

export { recomputeFhcObligationsForOrg } from "./data/fhc-obligations.server"

export {
  createFhcRequirementRule,
  setFhcRequirementRuleActive,
} from "./data/fhc-requirement-rules.server"

export { revalidateFhcSurfaces } from "./data/fhc-revalidate.server"

export { listFhcVerificationQueueForOrg } from "./data/fhc-verification.server"

export {
  listFhcDutyRestrictionsForOrg,
  createFhcDutyRestriction,
} from "./data/fhc-duty-restrictions.server"

export { createFhcOutlet } from "./data/fhc-outlets.server"

export { buildFhcComplianceReportCsv } from "./data/fhc-report-export.server"

export {
  linkFhcEvidenceDocument,
  listFhcEvidenceLinksForSubject,
} from "./data/fhc-evidence.server"

export {
  submitFhcHealthRenewal,
  submitFhcPermitRenewal,
  syncFhcHealthRenewalStateForObligation,
  syncFhcPermitRenewalStateForObligation,
} from "./data/fhc-renewal.server"

export { emitFhcExpiryAlertsForOrg } from "./data/fhc-expiry-notification.server"

export { listFhcEvidenceDocumentChoicesForEmployee } from "./data/fhc-evidence-documents.server"

export { listFhcHealthRecordsForOrg } from "./data/fhc-health-records.server"
