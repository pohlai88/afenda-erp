import {
  buildCrudSapAuditAction,
  buildErpAuditAction,
} from "@afenda/platform/erp/crud-sap.shared"

/**
 * Canonical audit action strings for Field Worker & Remote Workforce Management.
 *
 * Import `HRM_FRM_AUDIT` — do not hard-code `erp.hrm.field_workforce.*` in actions.
 */
export const HRM_FRM_AUDIT = {
  worksiteCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_worksite",
    verb: "create",
  }),
  worksiteUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_worksite",
    verb: "update",
  }),
  assignmentCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_assignment",
    verb: "create",
  }),
  assignmentUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_assignment",
    verb: "update",
  }),
  scheduleReferenceCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_schedule_reference",
    verb: "create",
  }),
  attendanceLinkCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_attendance_link",
    verb: "create",
  }),
  attendanceReconcile: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_attendance_link",
    verb: "audit",
  }),
  exceptionDetect: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_exception",
    verb: "audit",
  }),
  exceptionResolve: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_exception",
    verb: "resolve",
  }),
  travelStatusCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_travel_status",
    verb: "create",
  }),
  perDiemRateCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_per_diem_rate",
    verb: "create",
  }),
  perDiemReferenceApprove: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_per_diem_reference",
    verb: "approve",
  }),
  travelComplianceUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_travel_compliance",
    verb: "update",
  }),
  safetyCheckinCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_safety_checkin",
    verb: "create",
  }),
  checkinOverdue: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_assignment",
    verb: "audit",
  }),
  reportExport: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "field_workforce_report",
    verb: "audit",
  }),
} as const

export type HrmFrmAuditAction =
  (typeof HRM_FRM_AUDIT)[keyof typeof HRM_FRM_AUDIT]
