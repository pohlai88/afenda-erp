import {
  buildCrudSapAuditAction,
  buildErpAuditAction,
} from "@afenda/platform/erp/crud-sap.shared"

/**
 * Canonical audit action strings for Government Classification & Pay Grades.
 *
 * Import `HRM_GPG_AUDIT` — do not hard-code `erp.hrm.government_pay_grade.*`
 * in actions or integration doors.
 */
export const HRM_GPG_AUDIT = {
  classificationCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_classification",
    verb: "create",
  }),
  classificationUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_classification",
    verb: "update",
  }),
  payGradeCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade",
    verb: "create",
  }),
  payBandCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_band",
    verb: "create",
  }),
  salaryTableVersionCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_salary_table",
    verb: "create",
  }),
  salaryTableRowCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_salary_table_row",
    verb: "create",
  }),
  salaryTableVersionPublish: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_salary_table",
    verb: "approve",
  }),
  localityRuleCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_locality",
    verb: "create",
  }),
  employeeAssignmentCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_assignment",
    verb: "create",
  }),
  adjustmentReferenceCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_adjustment",
    verb: "create",
  }),
  gradeMovementCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_movement",
    verb: "create",
  }),
  stepIncreaseRuleCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_step_increase_rule",
    verb: "create",
  }),
  stepIncreaseEventCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_step_increase",
    verb: "create",
  }),
  stepIncreaseProcess: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_step_increase",
    verb: "resolve",
  }),
  reclassificationRequestCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_reclassification",
    verb: "create",
  }),
  reclassificationRequestDecide: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_reclassification",
    verb: "approve",
  }),
  gradeMovementApply: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_movement",
    verb: "resolve",
  }),
  reportExport: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade_report",
    verb: "audit",
  }),
  payrollIntegrationRead: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "government_pay_grade",
    verb: "audit",
  }),
} as const

export type HrmGpgAuditAction =
  (typeof HRM_GPG_AUDIT)[keyof typeof HRM_GPG_AUDIT]
