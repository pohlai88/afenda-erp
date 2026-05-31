import {
  HR_EXPENSE_APPROVE_CAPABILITY,
  HR_EXPENSE_AUDIT_READ_CAPABILITY,
  HR_EXPENSE_FINANCE_READ_CAPABILITY,
  HR_EXPENSE_READ_CAPABILITY,
  HR_EXPENSE_SENSITIVE_READ_CAPABILITY,
  HR_EXPENSE_WRITE_CAPABILITY,
} from "../schemas/hr.payroll.expense-constants.shared";

/** HRM-EXP-026 — role × capability × data scope for expense claims. */
export const HR_EXPENSE_PERMISSION_MATRIX = [
  {
    persona: "employee",
    capabilities: [HR_EXPENSE_READ_CAPABILITY, HR_EXPENSE_WRITE_CAPABILITY],
    scope: "own_claims",
    canSubmit: true,
    canApprove: false,
    canViewOrgWide: false,
    canViewAudit: false,
    canViewSensitiveAmounts: false,
  },
  {
    persona: "manager",
    capabilities: [HR_EXPENSE_READ_CAPABILITY, HR_EXPENSE_APPROVE_CAPABILITY],
    scope: "team_claims",
    canSubmit: false,
    canApprove: true,
    canViewOrgWide: false,
    canViewAudit: false,
    canViewSensitiveAmounts: false,
  },
  {
    persona: "finance",
    capabilities: [
      HR_EXPENSE_READ_CAPABILITY,
      HR_EXPENSE_FINANCE_READ_CAPABILITY,
      HR_EXPENSE_WRITE_CAPABILITY,
    ],
    scope: "organization_claims",
    canSubmit: false,
    canApprove: false,
    canViewOrgWide: true,
    canViewAudit: false,
    canViewSensitiveAmounts: true,
  },
  {
    persona: "hr",
    capabilities: [HR_EXPENSE_READ_CAPABILITY, HR_EXPENSE_WRITE_CAPABILITY],
    scope: "organization_claims",
    canSubmit: false,
    canApprove: false,
    canViewOrgWide: true,
    canViewAudit: false,
    canViewSensitiveAmounts: true,
  },
  {
    persona: "auditor",
    capabilities: [
      HR_EXPENSE_READ_CAPABILITY,
      HR_EXPENSE_AUDIT_READ_CAPABILITY,
      HR_EXPENSE_SENSITIVE_READ_CAPABILITY,
    ],
    scope: "organization_read_only",
    canSubmit: false,
    canApprove: false,
    canViewOrgWide: true,
    canViewAudit: true,
    canViewSensitiveAmounts: true,
  },
] as const;

export type HrExpensePermissionPersona =
  (typeof HR_EXPENSE_PERMISSION_MATRIX)[number]["persona"];
