import {
  buildCrudSapAuditAction,
  buildErpAuditAction,
} from "@afenda/platform/erp/crud-sap.shared"

/**
 * Canonical audit action strings for Food Handler Certification & Health Compliance.
 *
 * Import `HRM_FHC_AUDIT` — do not hard-code `erp.hrm.food_handler_compliance.*`
 * in actions or integration doors.
 *
 * Mapping to HRM-FHC-NNN requirement codes lives in `fhc-spec-map.shared.ts`.
 */
export const HRM_FHC_AUDIT = {
  outletCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_outlet",
    verb: "create",
  }),
  outletUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_outlet",
    verb: "update",
  }),
  requirementRuleCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_requirement",
    verb: "create",
  }),
  requirementRuleUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_requirement",
    verb: "update",
  }),
  obligationRecompute: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_obligation",
    verb: "audit",
  }),
  permitSubmit: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance.permit",
    verb: "submit",
  }),
  trainingRecord: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_training",
    verb: "create",
  }),
  healthCertificateSubmit: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance.health_certificate",
    verb: "submit",
  }),
  evidenceLink: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_evidence",
    verb: "create",
  }),
  verificationApprove: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance.verification",
    verb: "approve",
  }),
  verificationReject: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance.verification",
    verb: "reject",
  }),
  renewalSubmit: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance.renewal",
    verb: "submit",
  }),
  renewalVerify: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance.renewal",
    verb: "approve",
  }),
  expiryAlert: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance.alert",
    verb: "audit",
  }),
  dutyRestrictionCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_restriction",
    verb: "create",
  }),
  complianceReview: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance.review",
    verb: "audit",
  }),
  reportExport: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "food_handler_compliance_report",
    verb: "audit",
  }),
} as const

export type HrmFhcAuditAction =
  (typeof HRM_FHC_AUDIT)[keyof typeof HRM_FHC_AUDIT]
