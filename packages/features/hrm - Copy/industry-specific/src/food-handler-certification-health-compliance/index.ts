export { HRM_FHC_AUDIT, type HrmFhcAuditAction } from "./fhc.contract"

export {
  HRM_FHC_SPEC_MAP,
  listHrmFhcSpecCodes,
  type HrmFhcSpecArea,
  type HrmFhcSpecCode,
} from "./fhc-spec-map.shared"

export {
  HRM_FHC_SLICE_1_SPEC_CODES,
  HRM_FHC_SLICE_2_SPEC_CODES,
  HRM_FHC_SLICE_3_SPEC_CODES,
  HRM_FHC_SLICE_4_SPEC_CODES,
  HRM_FHC_SLICE_5_SPEC_CODES,
  HRM_FHC_SPEC_DELIVERY_STATUS,
  listHrmFhcSpecDeliveryRows,
  type HrmFhcSpecDeliveryStatus,
} from "./fhc-spec-status.shared"

export {
  FHC_LIST_SURFACE_IDS,
  type FhcListSurfaceId,
} from "./data/fhc-surface-metadata.shared"

export {
  HRM_FHC_COMPLIANCE_STATUSES,
  HRM_FHC_PERMIT_STATUSES,
  HRM_FHC_RENEWAL_STATES,
  HRM_FHC_RESTRICTION_SCOPES,
  HRM_FHC_TRAINING_TYPES,
  HRM_FHC_VERIFICATION_STATES,
  hrmFhcComplianceStatusSchema,
  hrmFhcPermitStatusSchema,
  hrmFhcRenewalStateSchema,
  hrmFhcRestrictionScopeSchema,
  hrmFhcTrainingTypeSchema,
  hrmFhcVerificationStateSchema,
  type HrmFhcComplianceStatus,
  type HrmFhcPermitStatus,
  type HrmFhcRenewalState,
  type HrmFhcRestrictionScope,
  type HrmFhcTrainingType,
  type HrmFhcVerificationState,
} from "./schemas/fhc-workflow-state.shared"

export { FoodHandlerCompliancePage } from "./components/food-handler-compliance-page"

export {
  fhcRequirementRuleMatchesEmployeeFacts,
  type FhcEmployeeMatchFacts,
  type FhcRequirementRuleCriteria,
} from "./data/fhc-rule-match.shared"

export {
  computeFhcObligationComplianceStatus,
  computeFhcObligationStatusAfterIdentification,
  deriveFhcComplianceFlags,
  isEligibleForFoodHandlingFromComplianceStatus,
  type FhcComplianceFlags,
  type FhcObligationComplianceInput,
} from "./data/fhc-compliance-status.shared"
