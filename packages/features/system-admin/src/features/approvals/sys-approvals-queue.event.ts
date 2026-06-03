export const systemAdminApprovalQueueAuditActions = {
  approve: "approvals.work_item.approve",
  reject: "approvals.work_item.reject",
} as const;

export type SystemAdminApprovalQueueAuditAction =
  (typeof systemAdminApprovalQueueAuditActions)[keyof typeof systemAdminApprovalQueueAuditActions];
