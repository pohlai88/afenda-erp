export const HR_PAYROLL_READ_CAPABILITY = "hr.payroll.read" as const;
export const HR_PAYROLL_WRITE_CAPABILITY = "hr.payroll.write" as const;
export const HR_PAYROLL_APPROVE_CAPABILITY = "hr.payroll.approve" as const;
export const HR_PAYROLL_AUDIT_READ_CAPABILITY = "hr.payroll.audit.read" as const;
export const HR_PAYROLL_ESS_READ_CAPABILITY = "hr.payroll.ess.read" as const;

export const HR_PAYROLL_SCHEDULES = [
  "monthly",
  "weekly",
  "bi_weekly",
  "semi_monthly",
  "ad_hoc",
] as const;

export const HR_PAYROLL_RUN_STATUSES = [
  "draft",
  "open",
  "input_collection",
  "validation",
  "preview",
  "pending_approval",
  "approved",
  "locked",
  "closed",
  "cancelled",
] as const;

export const HR_PAYROLL_PAYMENT_STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "reversed",
] as const;

export const HR_PAYROLL_INPUT_SOURCES = [
  "attendance",
  "leave",
  "claims",
  "benefits",
  "commissions",
  "employee_records",
  "manual",
] as const;

export type HrPayrollInputSource = (typeof HR_PAYROLL_INPUT_SOURCES)[number];

export const HR_PAYROLL_INPUT_STAGING_STATUSES = [
  "pending",
  "imported",
  "acknowledged",
  "rejected",
] as const;

export const HR_PAYROLL_ADJUSTMENT_KINDS = [
  "one_time_earning",
  "one_time_deduction",
  "manual",
  "proration",
  "retroactive",
] as const;

export const HR_PAYROLL_PRORATION_REASONS = [
  "new_joiner",
  "resignation",
  "unpaid_leave",
  "mid_period_salary_change",
] as const;

export const HR_PAYROLL_VALIDATION_SEVERITIES = [
  "info",
  "warning",
  "blocking",
] as const;

export const HR_PAYROLL_VALIDATION_CODES = [
  "missing_pay_group",
  "missing_bank_account",
  "missing_tax_identifier",
  "missing_base_salary",
  "missing_employee_number",
  "negative_net_pay",
  "unimported_inputs",
  "pending_adjustment_approval",
  "abnormal_variance",
  "run_not_ready",
] as const;

export const HR_PAYROLL_DEFAULT_VARIANCE_THRESHOLD_PERCENT = 25;
export const HR_PAYROLL_DEFAULT_WORKING_DAYS_PER_MONTH = 22;
