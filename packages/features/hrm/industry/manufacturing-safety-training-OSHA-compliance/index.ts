export { HRM_MSC_AUDIT, type HrmMscAuditAction } from "./msc.contract"

export {
  HRM_MSC_SPEC_MAP,
  listHrmMscSpecCodes,
  type HrmMscSpecArea,
  type HrmMscSpecCode,
} from "./msc-spec-map.shared"

export {
  HRM_MSC_SLICE_1_SPEC_CODES,
  HRM_MSC_SLICE_2_SPEC_CODES,
  HRM_MSC_SLICE_3_SPEC_CODES,
  HRM_MSC_SLICE_4_SPEC_CODES,
  HRM_MSC_SLICE_5_SPEC_CODES,
  HRM_MSC_SPEC_DELIVERY_STATUS,
  listHrmMscSpecDeliveryRows,
  type HrmMscSpecDeliveryStatus,
} from "./msc-spec-status.shared"

export {
  MSC_LIST_SURFACE_IDS,
  type MscListSurfaceId,
} from "./data/msc-surface-metadata.shared"

export {
  HRM_MSC_COMPLIANCE_STATUSES,
  HRM_MSC_CERT_STATUSES,
  HRM_MSC_TRAINING_CATEGORIES,
  HRM_MSC_HAZARD_ASSESSMENT_TYPES,
  HRM_MSC_HAZARD_ASSESSMENT_STATUSES,
  HRM_MSC_INCIDENT_TYPES,
  HRM_MSC_INCIDENT_STATUSES,
  HRM_MSC_CORRECTIVE_PRIORITIES,
  HRM_MSC_CORRECTIVE_STATUSES,
  HRM_MSC_RESTRICTION_SCOPES,
  hrmMscComplianceStatusSchema,
  type HrmMscComplianceStatus,
  type HrmMscCertStatus,
  type HrmMscTrainingCategory,
  type HrmMscHazardAssessmentType,
  type HrmMscHazardAssessmentStatus,
  type HrmMscIncidentType,
  type HrmMscIncidentStatus,
  type HrmMscCorrectivePriority,
  type HrmMscCorrectiveStatus,
  type HrmMscRestrictionScope,
} from "./schemas/msc-workflow-state.shared"

export { ManufacturingSafetyPage } from "./components/manufacturing-safety-page"

export {
  mscRequirementRuleMatchesEmployeeFacts,
  type MscEmployeeMatchFacts,
  type MscRequirementRuleCriteria,
} from "./data/msc-rule-match.shared"

export {
  computeMscObligationComplianceStatus,
  computeMscObligationStatusAfterIdentification,
  deriveMscComplianceFlags,
  isEligibleForSafetyWorkFromComplianceStatus,
  type MscComplianceFlags,
  type MscObligationComplianceInput,
} from "./data/msc-compliance-status.shared"
