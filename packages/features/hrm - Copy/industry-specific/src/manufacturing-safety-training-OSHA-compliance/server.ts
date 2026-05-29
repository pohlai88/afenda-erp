import "server-only"

export {
  resolveMscSurfaceAccess,
  type MscSurfaceAccess,
} from "./data/msc-access.server"

export {
  getMscSafetyEligibilityForScheduling,
  getMscSafetyTrainingForCompliance,
  listMscLearningRequirements,
  type MscLearningRequirementRow,
  type MscSafetyEligibilityForScheduling,
  type MscSafetyTrainingCompletionRow,
} from "./data/msc-integration.server"

export { loadManufacturingSafetyPageData } from "./data/msc-page-data.server"
export type { ManufacturingSafetyPageData } from "./data/msc-page-data.server"

export {
  listMscSitesForOrg,
  listMscSiteMasterRowsForOrg,
  listMscMachinesForOrg,
  listMscRequirementRulesForOrg,
  listMscEmployeeObligationsForOrg,
  listMscCertificationsForOrg,
  listMscHazardAssessmentsForOrg,
  listMscIncidentsForOrg,
  listMscCorrectiveActionsForOrg,
  listMscWorkRestrictionsForOrg,
  listMscEmployeeObligationsByStatusForOrg,
  listMscRegulatoryReferencesForOrg,
} from "./data/msc.queries.server"

export { buildMscComplianceReportCsv } from "./data/msc-report-export.server"
export { emitMscExpiryAlertsForOrg } from "./data/msc-expiry-notification.server"
export { createMscRequirementRule } from "./data/msc-requirement-rules.server"
export { createMscSite, createMscMachine } from "./data/msc-masters.server"
export {
  recordMscTrainingCompletion,
  recordMscSafetyCertification,
} from "./data/msc-records.server"
export {
  createMscHazardAssessment,
  createMscIncident,
  createMscCorrectiveAction,
} from "./data/msc-operational.server"
export {
  listMscEvidenceLinksForOrg,
  linkMscEvidenceDocument,
} from "./data/msc-evidence.server"
export {
  createMscRegulatoryReference,
  createMscWorkRestriction,
} from "./data/msc-compliance-records.server"

export { recomputeMscObligationsForOrg } from "./data/msc-obligations.server"
export { refreshMscObligationComplianceStatus } from "./data/msc-compliance-context.server"

export { revalidateMscSurfaces } from "./data/msc-revalidate.server"

export { summarizeMscOrgCompliance } from "./data/msc-overview.server"
