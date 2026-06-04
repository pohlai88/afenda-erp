import type { AppCapability } from "@afenda/kernel";

export const HR_RWS_READ_CAPABILITY = "hr.rws.read" satisfies AppCapability;
export const HR_RWS_WRITE_CAPABILITY = "hr.rws.write" satisfies AppCapability;
export const HR_RWS_APPROVE_CAPABILITY = "hr.rws.approve" satisfies AppCapability;
export const HR_RWS_AUDIT_READ_CAPABILITY =
  "hr.rws.audit.read" satisfies AppCapability;
export const HR_RWS_RESTRICTED_READ_CAPABILITY =
  "hr.rws.restricted.read" satisfies AppCapability;
export const HR_RWS_LABOR_COST_READ_CAPABILITY =
  "hr.rws.labor-cost.read" satisfies AppCapability;
export const HR_RWS_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.rws.integration.expose" satisfies AppCapability;

export const HR_RWS_SCHEDULE_STATUSES = [
  "draft",
  "published",
  "changed",
  "cancelled",
  "archived",
] as const;

export const HR_RWS_WORKER_TYPES = [
  "hourly",
  "part_time",
  "temporary",
  "seasonal",
  "student",
  "minor",
  "restricted",
] as const;

export const HR_RWS_PERIOD_TYPES = [
  "daily",
  "weekly",
  "bi_weekly",
  "monthly",
  "seasonal",
  "campaign",
] as const;

export const HR_RWS_SHIFT_TYPES = [
  "opening",
  "midday",
  "closing",
  "overnight",
  "holiday",
  "weekend",
  "late_night",
  "peak",
] as const;

export const HR_RWS_RETAIL_ROLES = [
  "cashier",
  "supervisor",
  "key_holder",
  "sales_associate",
  "stockroom",
  "visual_merchandiser",
  "certified_operator",
] as const;

export const HR_RWS_AVAILABILITY_STATUSES = [
  "preferred",
  "available",
  "unavailable",
  "blocked",
] as const;

export const HR_RWS_COVERAGE_STATUSES = [
  "understaffed",
  "overstaffed",
  "balanced",
] as const;

export const HR_RWS_OPEN_SHIFT_STATUSES = [
  "draft",
  "posted",
  "claimed",
  "pending_approval",
  "approved",
  "rejected",
  "cancelled",
  "assigned",
] as const;

export const HR_RWS_SWAP_STATUSES = [
  "requested",
  "validation_failed",
  "pending_approval",
  "approved",
  "rejected",
  "returned",
  "overridden",
  "cancelled",
] as const;

export const HR_RWS_DEMAND_SOURCES = [
  "sales_volume",
  "footfall",
  "promotion_period",
  "holiday_period",
  "store_forecast",
] as const;

export const HR_RWS_BUDGET_STATUSES = [
  "within_budget",
  "over_budget",
  "pending_review",
  "approved_exception",
] as const;

export const HR_RWS_COMPLIANCE_RULES = [
  "max_daily_hours",
  "max_weekly_hours",
  "minimum_rest_period",
  "meal_break",
  "rest_break",
  "minor_worker",
  "student_worker",
  "restricted_worker",
  "holiday",
  "weekend",
  "late_night",
  "peak_season",
] as const;

export const HR_RWS_COMPLIANCE_SEVERITIES = [
  "info",
  "warning",
  "blocker",
] as const;

export const HR_RWS_NOTIFICATION_TYPES = [
  "schedule_published",
  "schedule_changed",
  "open_shift",
  "swap_request",
  "swap_approved",
  "swap_rejected",
  "cancellation",
] as const;

export const HR_RWS_INTEGRATION_TARGETS = [
  "attendance_outcomes",
  "payroll_processing",
  "leave_attendance_management",
  "time_clock_integration",
  "overtime_management",
  "document_management",
  "retail_operations",
  "workforce_planning",
] as const;

export const HR_RWS_REPORT_GROUP_BY = [
  "store",
  "department",
  "employee",
  "manager",
  "role",
  "shift",
  "labor_cost",
  "budget_variance",
  "coverage_gap",
  "period",
] as const;

export const HR_RWS_STATUS_FILTERS = [
  "all",
  ...HR_RWS_SCHEDULE_STATUSES,
  ...HR_RWS_AVAILABILITY_STATUSES,
  ...HR_RWS_COVERAGE_STATUSES,
  ...HR_RWS_OPEN_SHIFT_STATUSES,
  ...HR_RWS_SWAP_STATUSES,
  ...HR_RWS_BUDGET_STATUSES,
  ...HR_RWS_COMPLIANCE_SEVERITIES,
  "active",
  "released",
] as const;

export type HrRwsScheduleStatus = (typeof HR_RWS_SCHEDULE_STATUSES)[number];
export type HrRwsWorkerType = (typeof HR_RWS_WORKER_TYPES)[number];
export type HrRwsPeriodType = (typeof HR_RWS_PERIOD_TYPES)[number];
export type HrRwsShiftType = (typeof HR_RWS_SHIFT_TYPES)[number];
export type HrRwsRetailRole = (typeof HR_RWS_RETAIL_ROLES)[number];
export type HrRwsAvailabilityStatus =
  (typeof HR_RWS_AVAILABILITY_STATUSES)[number];
export type HrRwsCoverageStatus = (typeof HR_RWS_COVERAGE_STATUSES)[number];
export type HrRwsOpenShiftStatus =
  (typeof HR_RWS_OPEN_SHIFT_STATUSES)[number];
export type HrRwsSwapStatus = (typeof HR_RWS_SWAP_STATUSES)[number];
export type HrRwsDemandSource = (typeof HR_RWS_DEMAND_SOURCES)[number];
export type HrRwsBudgetStatus = (typeof HR_RWS_BUDGET_STATUSES)[number];
export type HrRwsComplianceRule = (typeof HR_RWS_COMPLIANCE_RULES)[number];
export type HrRwsComplianceSeverity =
  (typeof HR_RWS_COMPLIANCE_SEVERITIES)[number];
export type HrRwsNotificationType =
  (typeof HR_RWS_NOTIFICATION_TYPES)[number];
export type HrRwsIntegrationTarget =
  (typeof HR_RWS_INTEGRATION_TARGETS)[number];
export type HrRwsReportGroupBy = (typeof HR_RWS_REPORT_GROUP_BY)[number];
export type HrRwsStatusFilter = (typeof HR_RWS_STATUS_FILTERS)[number];

export const HR_INDUSTRY_RWS_READ_CAPABILITY = HR_RWS_READ_CAPABILITY;
export const HR_INDUSTRY_RWS_WRITE_CAPABILITY = HR_RWS_WRITE_CAPABILITY;
export const HR_INDUSTRY_RWS_APPROVE_CAPABILITY = HR_RWS_APPROVE_CAPABILITY;
export const HR_INDUSTRY_RWS_AUDIT_READ_CAPABILITY =
  HR_RWS_AUDIT_READ_CAPABILITY;
export const HR_INDUSTRY_RWS_RESTRICTED_READ_CAPABILITY =
  HR_RWS_RESTRICTED_READ_CAPABILITY;
export const HR_INDUSTRY_RWS_LABOR_COST_READ_CAPABILITY =
  HR_RWS_LABOR_COST_READ_CAPABILITY;
export const HR_INDUSTRY_RWS_INTEGRATION_EXPOSE_CAPABILITY =
  HR_RWS_INTEGRATION_EXPOSE_CAPABILITY;
