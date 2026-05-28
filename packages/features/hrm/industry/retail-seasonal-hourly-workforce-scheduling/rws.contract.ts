import {
  buildCrudSapAuditAction,
  buildErpAuditAction,
} from "@afenda/platform/erp/crud-sap.shared"

/** Canonical audit strings for Retail Seasonal & Hourly Workforce Scheduling. */
export const HRM_RWS_AUDIT = {
  storeCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_store",
    verb: "create",
  }),
  storeUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_store",
    verb: "update",
  }),
  periodCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_period",
    verb: "create",
  }),
  periodUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_period",
    verb: "update",
  }),
  periodPublish: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_period",
    verb: "approve",
  }),
  assignmentLinkCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_assignment_link",
    verb: "create",
  }),
  coverageSlotCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_coverage_slot",
    verb: "create",
  }),
  demandReferenceCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_demand_reference",
    verb: "create",
  }),
  budgetSnapshotCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_budget_snapshot",
    verb: "create",
  }),
  budgetSnapshotUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_budget_snapshot",
    verb: "update",
  }),
  openShiftCreate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_open_shift",
    verb: "create",
  }),
  openShiftClaim: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_open_shift",
    verb: "resolve",
  }),
  policyUpdate: buildCrudSapAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_policy",
    verb: "update",
  }),
  reportExport: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule_report",
    verb: "audit",
  }),
  payrollIntegrationRead: buildErpAuditAction({
    area: "erp",
    module: "hrm",
    object: "retail_schedule",
    verb: "audit",
  }),
} as const

export type HrmRwsAuditAction =
  (typeof HRM_RWS_AUDIT)[keyof typeof HRM_RWS_AUDIT]
