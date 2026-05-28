import { buildCrudSapAuditAction } from "@afenda/platform/erp/crud-sap.shared"

/**
 * Canonical audit action strings for Employee Engagement Surveys.
 * Wire `writeIamAuditEvent` / `writeAuditEvent7W1H` after successful commits in slices 1–5.
 */
export const HRM_EMPLOYEE_ENGAGEMENT_AUDIT = {
  template: {
    create: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_template",
      verb: "create",
    }),
    update: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_template",
      verb: "update",
    }),
    deprecate: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_template",
      verb: "deprecate",
    }),
  },
  survey: {
    create: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_survey",
      verb: "create",
    }),
    update: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_survey",
      verb: "update",
    }),
    publish: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_survey",
      verb: "update",
    }),
    close: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_survey",
      verb: "update",
    }),
  },
  invitation: {
    create: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_invitation",
      verb: "create",
    }),
    publish: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_invitation",
      verb: "create",
    }),
    remind: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_invitation",
      verb: "audit",
    }),
  },
  response: {
    draft: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_response",
      verb: "create",
    }),
    submit: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_response",
      verb: "update",
    }),
  },
  analytics: {
    calculate: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_analytics",
      verb: "predict",
    }),
    export: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_analytics",
      verb: "audit",
    }),
  },
  improvementAction: {
    create: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_improvement_action",
      verb: "create",
    }),
    update: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_improvement_action",
      verb: "update",
    }),
    complete: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_improvement_action",
      verb: "update",
    }),
    overdueNotify: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_improvement_action",
      verb: "audit",
    }),
  },
  openText: {
    tag: buildCrudSapAuditAction({
      area: "erp",
      module: "hrm",
      object: "employee_engagement_open_text",
      verb: "update",
    }),
  },
} as const

export type HrmEmployeeEngagementAuditAction =
  | (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["template"][keyof (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["template"]]
  | (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["survey"][keyof (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["survey"]]
  | (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["invitation"][keyof (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["invitation"]]
  | (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["response"][keyof (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["response"]]
  | (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["analytics"][keyof (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["analytics"]]
  | (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["improvementAction"][keyof (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["improvementAction"]]
  | (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["openText"][keyof (typeof HRM_EMPLOYEE_ENGAGEMENT_AUDIT)["openText"]]

/** Flat list for contract tests and audit coverage matrix (HRM-ENG-034). */
export const HRM_EMPLOYEE_ENGAGEMENT_AUDIT_ACTIONS = [
  ...Object.values(HRM_EMPLOYEE_ENGAGEMENT_AUDIT.template),
  ...Object.values(HRM_EMPLOYEE_ENGAGEMENT_AUDIT.survey),
  ...Object.values(HRM_EMPLOYEE_ENGAGEMENT_AUDIT.invitation),
  ...Object.values(HRM_EMPLOYEE_ENGAGEMENT_AUDIT.response),
  ...Object.values(HRM_EMPLOYEE_ENGAGEMENT_AUDIT.analytics),
  ...Object.values(HRM_EMPLOYEE_ENGAGEMENT_AUDIT.improvementAction),
  ...Object.values(HRM_EMPLOYEE_ENGAGEMENT_AUDIT.openText),
] as const satisfies readonly HrmEmployeeEngagementAuditAction[]
