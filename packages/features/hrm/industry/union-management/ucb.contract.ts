import {
  buildCrudSapAuditAction,
  buildErpAuditAction,
} from "@afenda/platform/erp/crud-sap.shared"

/** Canonical audit strings for Union & Collective Bargaining Management. */
export const HRM_UCB_AUDIT = {
  unionCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.union",
    verb: "create",
  }),
  unionUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.union",
    verb: "update",
  }),
  cbaCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.cba",
    verb: "create",
  }),
  cbaUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.cba",
    verb: "update",
  }),
  membershipCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.membership",
    verb: "create",
  }),
  membershipUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.membership",
    verb: "update",
  }),
  unitAssignmentCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.unit_assignment",
    verb: "create",
  }),
  cbaRuleCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.cba_rule",
    verb: "create",
  }),
  cbaRuleUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.cba_rule",
    verb: "update",
  }),
  seniorityUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.seniority",
    verb: "update",
  }),
  complianceFindingCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.compliance_finding",
    verb: "create",
  }),
  duesReferenceCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.dues_reference",
    verb: "create",
  }),
  duesReferenceUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.dues_reference",
    verb: "update",
  }),
  grievanceCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.grievance",
    verb: "create",
  }),
  grievanceUpdate: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.grievance",
    verb: "update",
  }),
  grievanceStepCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.grievance_step",
    verb: "create",
  }),
  representativeCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.representative",
    verb: "create",
  }),
  lrMeetingCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.lr_meeting",
    verb: "create",
  }),
  renewalEventCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.renewal",
    verb: "create",
  }),
  reportExport: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining.report",
    verb: "audit",
  }),
  integrationRead: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "union_collective_bargaining",
    verb: "audit",
  }),
} as const

export type HrmUcbAuditAction =
  (typeof HRM_UCB_AUDIT)[keyof typeof HRM_UCB_AUDIT]
