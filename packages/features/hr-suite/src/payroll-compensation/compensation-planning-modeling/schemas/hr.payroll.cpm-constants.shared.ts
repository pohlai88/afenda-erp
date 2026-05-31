export const HR_CPM_CYCLE_STATUSES = [
  "draft",
  "planning",
  "in_review",
  "approved",
  "closed",
  "cancelled",
] as const;

export type HrCpmCycleStatus = (typeof HR_CPM_CYCLE_STATUSES)[number];

/** CPM-002 cycle types. */
export const HR_CPM_CYCLE_TYPES = [
  "annual_review",
  "merit_review",
  "promotion_review",
  "market_adjustment",
  "equity_adjustment",
  "retention_adjustment",
] as const;

export type HrCpmCycleType = (typeof HR_CPM_CYCLE_TYPES)[number];

/** CPM-003 budget pool scopes. */
export const HR_CPM_BUDGET_POOL_SCOPES = [
  "organization",
  "legal_entity",
  "department",
  "business_unit",
  "grade",
  "location",
  "manager_group",
] as const;

export type HrCpmBudgetPoolScope = (typeof HR_CPM_BUDGET_POOL_SCOPES)[number];

/** CPM-008..012 adjustment types. */
export const HR_CPM_ADJUSTMENT_TYPES = [
  "merit",
  "promotion",
  "market",
  "equity",
  "retention",
  "special",
] as const;

export type HrCpmAdjustmentType = (typeof HR_CPM_ADJUSTMENT_TYPES)[number];

export const HR_CPM_READ_CAPABILITY = "hr.cpm.read" as const;
export const HR_CPM_WRITE_CAPABILITY = "hr.cpm.write" as const;
export const HR_CPM_APPROVE_CAPABILITY = "hr.cpm.approve" as const;

export const HR_CPM_LOCKED_STATUSES = ["approved"] as const;
export const HR_CPM_EDITABLE_STATUSES = [
  "draft",
  "submitted",
  "hr_review",
  "pending_approval",
  "returned",
] as const;
