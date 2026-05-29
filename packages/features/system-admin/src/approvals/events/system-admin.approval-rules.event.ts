export const systemAdminApprovalRuleWebhookEvents = [
  "system-admin.approval.updated",
] as const;

export const systemAdminApprovalRuleAuditActions = [
  "system-admin.approval_rule.create",
  "system-admin.approval_rule.update",
  "system-admin.approval_rule.disable",
  "system-admin.approval_rule.deprecate",
] as const;

export type SystemAdminApprovalRuleWebhookEvent =
  (typeof systemAdminApprovalRuleWebhookEvents)[number];

export type SystemAdminApprovalRuleAuditAction =
  (typeof systemAdminApprovalRuleAuditActions)[number];

export const systemAdminApprovalRuleAuditActionsByMode = {
  create: "system-admin.approval_rule.create",
  update: "system-admin.approval_rule.update",
  disable: "system-admin.approval_rule.disable",
  deprecate: "system-admin.approval_rule.deprecate",
} as const satisfies Record<string, SystemAdminApprovalRuleAuditAction>;
