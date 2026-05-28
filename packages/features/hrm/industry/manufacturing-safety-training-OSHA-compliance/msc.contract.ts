import {
  buildCrudSapAuditAction,
  buildErpAuditAction,
} from "@afenda/platform/erp/crud-sap.shared"

/**
 * Canonical audit action strings for Manufacturing Safety Training & OSHA Compliance.
 *
 * Import `HRM_MSC_AUDIT` — do not hard-code `erp.hrm.manufacturing_safety.*`
 * in actions or integration doors.
 */
export const HRM_MSC_AUDIT = {
  siteCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_site",
    verb: "create",
  }),
  siteUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_site",
    verb: "update",
  }),
  machineCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_machine",
    verb: "create",
  }),
  requirementRuleCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_requirement",
    verb: "create",
  }),
  requirementRuleUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_requirement",
    verb: "update",
  }),
  obligationRecompute: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_obligation",
    verb: "audit",
  }),
  trainingRecord: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_training",
    verb: "create",
  }),
  certificationRecord: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_certification",
    verb: "create",
  }),
  regulatoryReferenceCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_regulatory",
    verb: "create",
  }),
  workRestrictionCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_restriction",
    verb: "create",
  }),
  hazardAssessmentCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_hazard",
    verb: "create",
  }),
  hazardAssessmentUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_hazard",
    verb: "update",
  }),
  incidentReport: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_incident",
    verb: "create",
  }),
  incidentUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_incident",
    verb: "update",
  }),
  correctiveActionCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_corrective",
    verb: "create",
  }),
  correctiveActionUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_corrective",
    verb: "update",
  }),
  evidenceLink: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_evidence",
    verb: "create",
  }),
  expiryAlert: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety.alert",
    verb: "audit",
  }),
  complianceReview: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety.review",
    verb: "audit",
  }),
  reportExport: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "manufacturing_safety_report",
    verb: "audit",
  }),
} as const

export type HrmMscAuditAction =
  (typeof HRM_MSC_AUDIT)[keyof typeof HRM_MSC_AUDIT]
