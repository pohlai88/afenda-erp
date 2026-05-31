/** HRM-EXP-012..013 — expense claim line item kinds. */
export const HR_EXPENSE_LINE_ITEM_KINDS = [
  "standard",
  "foreign_currency",
  "mileage",
  "travel",
] as const;

export type HrExpenseLineItemKind = (typeof HR_EXPENSE_LINE_ITEM_KINDS)[number];

/** HRM-EXP-013 — travel expense components. */
export const HR_EXPENSE_TRAVEL_COMPONENTS = [
  "flight",
  "hotel",
  "meals",
  "transport",
  "per_diem",
] as const;

export type HrExpenseTravelComponent =
  (typeof HR_EXPENSE_TRAVEL_COMPONENTS)[number];

/** Line-level approval decision used in reimbursement totals. */
export const HR_EXPENSE_LINE_DECISIONS = [
  "pending",
  "approved",
  "rejected",
] as const;

export type HrExpenseLineDecision = (typeof HR_EXPENSE_LINE_DECISIONS)[number];

/** HRM-EXP-012 — mileage distance units. */
export const HR_EXPENSE_DISTANCE_UNITS = ["kilometer", "mile"] as const;

export type HrExpenseDistanceUnit = (typeof HR_EXPENSE_DISTANCE_UNITS)[number];

/** HRM-EXP-021 — claim lifecycle statuses (mirrors DB enum). */
export const HR_EXPENSE_CLAIM_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "returned",
  "paid",
  "cancelled",
] as const;

export type HrExpenseClaimStatus = (typeof HR_EXPENSE_CLAIM_STATUSES)[number];

export const HR_EXPENSE_PAYMENT_CHANNELS = [
  "payroll",
  "accounts_payable",
] as const;

export type HrExpensePaymentChannel =
  (typeof HR_EXPENSE_PAYMENT_CHANNELS)[number];

/** HRM-EXP-027 — notification event kinds. */
export const HR_EXPENSE_NOTIFICATION_KINDS = [
  "submitted",
  "approved",
  "rejected",
  "returned",
  "overdue",
  "paid",
] as const;

export type HrExpenseNotificationKind =
  (typeof HR_EXPENSE_NOTIFICATION_KINDS)[number];

/** HRM-EXP-002 — configured claim categories. */
export const HR_EXPENSE_CLAIM_CATEGORIES = [
  "travel",
  "meals",
  "accommodation",
  "transport",
  "fuel",
  "parking",
  "tolls",
  "office_supplies",
  "medical",
  "training",
] as const;

export type HrExpenseClaimCategory = (typeof HR_EXPENSE_CLAIM_CATEGORIES)[number];

/** Categories that require a receipt attachment (HRM-EXP-004). */
export const HR_EXPENSE_RECEIPT_MANDATORY_CATEGORIES: readonly HrExpenseClaimCategory[] =
  [
    "meals",
    "accommodation",
    "transport",
    "fuel",
    "parking",
    "tolls",
    "office_supplies",
    "medical",
  ];

export const HR_EXPENSE_READ_CAPABILITY = "hr.expense.read" as const;
export const HR_EXPENSE_WRITE_CAPABILITY = "hr.expense.write" as const;
export const HR_EXPENSE_APPROVE_CAPABILITY = "hr.expense.approve" as const;
export const HR_EXPENSE_FINANCE_READ_CAPABILITY =
  "hr.expense.finance.read" as const;
export const HR_EXPENSE_AUDIT_READ_CAPABILITY = "hr.expense.audit.read" as const;
export const HR_EXPENSE_SENSITIVE_READ_CAPABILITY =
  "hr.expense.sensitive.read" as const;
