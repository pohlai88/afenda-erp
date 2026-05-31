/** MCP-025 — country payroll access capabilities. */
export const HR_MCP_READ_CAPABILITY = "hr.mcp.read" as const;
export const HR_MCP_WRITE_CAPABILITY = "hr.mcp.write" as const;
export const HR_MCP_ADMIN_CAPABILITY = "hr.mcp.admin" as const;
export const HR_MCP_STATUTORY_ADMIN_CAPABILITY =
  "hr.mcp.statutory.admin" as const;
export const HR_MCP_AUDIT_READ_CAPABILITY = "hr.mcp.audit.read" as const;

/** MCP-006/007 — pay component treatment enums (aligned with Drizzle). */
export const HR_MCP_PAY_COMPONENT_TAX_TREATMENTS = [
  "taxable",
  "non_taxable",
] as const;

export const HR_MCP_PAY_COMPONENT_CONTRIBUTION_TREATMENTS = [
  "contributable",
  "non_contributable",
] as const;

export const HR_MCP_PAY_COMPONENT_PENSION_TREATMENTS = [
  "pensionable",
  "non_pensionable",
] as const;

/** MCP-023 — country payroll rule version lifecycle. */
export const HR_MCP_RULE_VERSION_STATUSES = [
  "draft",
  "published",
  "superseded",
  "archived",
] as const;

export type HrMcpRuleVersionStatus =
  (typeof HR_MCP_RULE_VERSION_STATUSES)[number];

export const HR_MCP_LOCKED_RULE_VERSION_STATUSES = [
  "published",
  "superseded",
  "archived",
] as const;

/** MCP-014 — employee classification enums. */
export const HR_MCP_TAX_RESIDENCY_VALUES = [
  "resident",
  "non_resident",
  "dual",
] as const;

export type HrMcpTaxResidency = (typeof HR_MCP_TAX_RESIDENCY_VALUES)[number];

export const HR_MCP_WORKER_CATEGORY_VALUES = [
  "full_time",
  "part_time",
  "contractor",
  "intern",
  "temporary",
  "director",
  "other",
] as const;

export type HrMcpWorkerCategory =
  (typeof HR_MCP_WORKER_CATEGORY_VALUES)[number];

export const HR_MCP_STATUTORY_ELIGIBILITY_VALUES = [
  "eligible",
  "ineligible",
  "pending",
] as const;

export type HrMcpStatutoryEligibility =
  (typeof HR_MCP_STATUTORY_ELIGIBILITY_VALUES)[number];

/** MCP-010 — payroll calendar enums. */
export const HR_MCP_CALENDAR_PERIOD_KINDS = [
  "weekly",
  "biweekly",
  "semi_monthly",
  "monthly",
  "custom",
] as const;

export const HR_MCP_STATUTORY_DEADLINE_KINDS = [
  "tax_filing",
  "contribution_filing",
  "employer_declaration",
  "employee_income_statement",
  "other",
] as const;

/** MCP-013 — leave payroll impact treatment. */
export const HR_MCP_LEAVE_PAYROLL_IMPACTS = [
  "paid",
  "unpaid",
  "statutory_paid",
  "no_pay",
] as const;

export type HrMcpLeavePayrollImpact =
  (typeof HR_MCP_LEAVE_PAYROLL_IMPACTS)[number];

/** MCP-011 — proration scenario and basis enums. */
export const HR_MCP_PRORATION_SCENARIOS = [
  "new_joiner",
  "termination",
  "unpaid_leave",
  "mid_period_salary_change",
  "other",
] as const;

export const HR_MCP_PRORATION_BASES = [
  "calendar_days",
  "working_days",
  "monthly_fraction",
] as const;

export type HrMcpProrationBasis = (typeof HR_MCP_PRORATION_BASES)[number];
