export { HRM_GPG_AUDIT, type HrmGpgAuditAction } from "./gpg.contract"

export {
  HRM_GPG_SPEC_MAP,
  listHrmGpgSpecCodes,
  type HrmGpgSpecArea,
  type HrmGpgSpecCode,
} from "./gpg-spec-map.shared"

export {
  HRM_GPG_SLICE_0_SPEC_CODES,
  HRM_GPG_SLICE_1_SPEC_CODES,
  HRM_GPG_SLICE_2_SPEC_CODES,
  HRM_GPG_SLICE_3_SPEC_CODES,
  HRM_GPG_SLICE_4_SPEC_CODES,
  HRM_GPG_SLICE_5_SPEC_CODES,
  HRM_GPG_SPEC_DELIVERY_STATUS,
  listHrmGpgSpecDeliveryRows,
  type HrmGpgSpecDeliveryStatus,
} from "./gpg-spec-status.shared"

export {
  GPG_LIST_SURFACE_IDS,
  GPG_STAT_SURFACE_KEY,
  type GpgListSurfaceId,
} from "./data/gpg-surface-metadata.shared"

export {
  HRM_GPG_ADJUSTMENT_TYPES,
  HRM_GPG_APPOINTMENT_TYPES,
  HRM_GPG_CLASSIFICATION_SCHEMES,
  HRM_GPG_LOCALITY_TYPES,
  HRM_GPG_MASTER_STATES,
  HRM_GPG_MOVEMENT_STATES,
  HRM_GPG_MOVEMENT_TYPES,
  HRM_GPG_RECLASSIFICATION_STATES,
  HRM_GPG_SALARY_TABLE_VERSION_STATES,
  HRM_GPG_STEP_INCREASE_EVENT_STATES,
  hrmGpgAdjustmentTypeSchema,
  hrmGpgAppointmentTypeSchema,
  hrmGpgClassificationSchemeSchema,
  hrmGpgLocalityTypeSchema,
  hrmGpgMasterStateSchema,
  hrmGpgMovementTypeSchema,
  hrmGpgReclassificationStateSchema,
  hrmGpgSalaryTableVersionStateSchema,
  hrmGpgStepIncreaseEventStateSchema,
  type HrmGpgAdjustmentType,
  type HrmGpgAppointmentType,
  type HrmGpgClassificationScheme,
  type HrmGpgLocalityType,
  type HrmGpgMasterState,
  type HrmGpgMovementState,
  type HrmGpgMovementType,
  type HrmGpgReclassificationState,
  type HrmGpgSalaryTableVersionState,
  type HrmGpgStepIncreaseEventState,
} from "./schemas/gpg-workflow-state.shared"

export { GovernmentPayGradesPage } from "./components/government-pay-grades-page"
