export const approvalsWorkItemAuditActions = {
  approve: "approvals.work_item.approve",
  reject: "approvals.work_item.reject",
} as const;

export type ApprovalsWorkItemAuditAction =
  (typeof approvalsWorkItemAuditActions)[keyof typeof approvalsWorkItemAuditActions];
