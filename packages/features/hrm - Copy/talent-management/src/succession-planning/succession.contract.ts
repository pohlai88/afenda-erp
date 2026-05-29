import { buildCrudSapAuditAction } from "@afenda/platform/erp/crud-sap.shared"

export const HRM_SUCCESSION_AUDIT = {
  criticalRoleCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.critical_role",
    verb: "create",
  }),
  criticalRoleUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.critical_role",
    verb: "update",
  }),
  nominationCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.nomination",
    verb: "create",
  }),
  nominationUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.nomination",
    verb: "update",
  }),
  developmentLinkCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.development_link",
    verb: "create",
  }),
  talentPoolCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.talent_pool",
    verb: "create",
  }),
  poolMemberAdd: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.pool_member",
    verb: "create",
  }),
  calibrationSessionCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.calibration_session",
    verb: "create",
  }),
  calibrationEntryUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.calibration_entry",
    verb: "update",
  }),
  replacementPlanCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.replacement_plan",
    verb: "create",
  }),
  reviewCycleCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.review_cycle",
    verb: "create",
  }),
  riskSnapshotCompute: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.risk_snapshot",
    verb: "audit",
  }),
  reportExport: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "succession.report",
    verb: "audit",
  }),
} as const

export type HrmSuccessionAuditAction =
  (typeof HRM_SUCCESSION_AUDIT)[keyof typeof HRM_SUCCESSION_AUDIT]
