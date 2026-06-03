/** HRM-PAY-021..023 — payroll run status transition map. */
export const PAYROLL_WORKFLOW_TRANSITIONS = {
  draft: ["validation"],
  open: ["input_collection"],
  input_collection: ["validation"],
  validation: ["preview"],
  preview: ["pending_approval"],
  pending_approval: ["approved"],
  approved: ["locked"],
  locked: ["closed"],
  closed: ["cancelled"],
  cancelled: [],
} as const;

export type PayrollWorkflowStatus = keyof typeof PAYROLL_WORKFLOW_TRANSITIONS;
