export const hrExpenseUiCopy = {
  page: {
    title: "Expense Reimbursement",
    description:
      "Submit claims, attach receipts, route approvals, and track reimbursement status (HRM-EXP-001–028).",
  },
  accessDenied: {
    title: "Expense reimbursement unavailable",
    description:
      "You need hr.expense.read to view claims, reports, and audit history for this organization.",
  },
  claims: {
    sectionTitle: "Expense claims",
    sectionDescription:
      "Employee-submitted claims with policy validation, duplicate flags, and approval workflow.",
    surfaceHeaderTitle: "Claims register",
    searchLabel: "Search claims",
    searchPlaceholder: "Reference, employee, category, or status",
    emptyTitle: "No expense claims yet",
    emptyDescription: "Submit a claim to start the reimbursement workflow.",
    colReference: "Reference",
    colEmployee: "Employee",
    colDate: "Expense date",
    colCategory: "Category",
    colAmount: "Amount",
    colStatus: "Status",
    colFlags: "Flags",
    colReimbursable: "Reimbursable",
    colActions: "Actions",
    trailingApproveLabel: "Approve",
    trailingRejectLabel: "Reject",
    trailingReturnLabel: "Return",
    trailingClarifyLabel: "Request clarification",
    trailingRejectReasonLabel: "Rejection reason",
    trailingReturnReasonLabel: "Return reason",
    trailingClarifyNoteLabel: "Clarification note",
  },
  submit: {
    sectionTitle: "Submit claim",
    sectionDescription:
      "Capture expense date, category, amount, currency, description, and receipt reference (HRM-EXP-001–005).",
    formReferenceLabel: "Receipt reference",
    formReferencePlaceholder: "blob:// or document id after upload",
    formSubmitLabel: "Submit claim",
    receiptRequiredHint:
      "Receipt attachment is required for this category per expense policy.",
  },
  receipt: {
    sectionTitle: "Receipt upload",
    sectionDescription:
      "Attach proof of payment before submitting when policy requires a receipt (HRM-EXP-003–004).",
    uploadLabel: "Upload receipt",
    uploadHint: "Accepted: PDF, PNG, JPG. Stored as a supporting document reference.",
  },
  reports: {
    sectionTitle: "Expense reports",
    sectionDescription:
      "Aggregated claim totals by department, category, status, and period (HRM-EXP-025).",
    surfaceHeaderTitle: "Expense report summary",
    searchLabel: "Search reports",
    searchPlaceholder: "Department, category, or status",
    emptyTitle: "No report rows",
    emptyDescription: "Reports appear after claims are submitted.",
    colPeriod: "Period",
    colDepartment: "Department",
    colCategory: "Category",
    colStatus: "Status",
    colCount: "Claims",
    colTotal: "Total",
    colCurrency: "Currency",
  },
  audit: {
    sectionTitle: "Audit trail",
    sectionDescription:
      "Submission, validation, approval, rejection, return, and payment events (HRM-EXP-028).",
    surfaceHeaderTitle: "Expense audit log",
    searchLabel: "Search audit",
    searchPlaceholder: "Action, reference, or detail",
    emptyTitle: "No audit events",
    emptyDescription: "Audit events are recorded for every claim action.",
    colWhen: "When",
    colReference: "Claim",
    colAction: "Action",
    colActor: "Actor",
    colDetail: "Detail",
  },
} as const;
