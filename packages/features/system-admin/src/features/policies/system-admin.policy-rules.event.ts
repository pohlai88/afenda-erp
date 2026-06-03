export const systemAdminPolicyRuleWebhookEvents = [
  "system-admin.policy.updated",
] as const;

export const systemAdminPolicyRuleAuditActions = [
  "system-admin.policy_rule.create",
  "system-admin.policy_rule.update",
  "system-admin.policy_rule.disable",
  "system-admin.policy_rule.deprecate",
] as const;

export type SystemAdminPolicyRuleWebhookEvent =
  (typeof systemAdminPolicyRuleWebhookEvents)[number];

export type SystemAdminPolicyRuleAuditAction =
  (typeof systemAdminPolicyRuleAuditActions)[number];

export const systemAdminPolicyRuleAuditActionsByMode = {
  create: "system-admin.policy_rule.create",
  update: "system-admin.policy_rule.update",
  disable: "system-admin.policy_rule.disable",
  deprecate: "system-admin.policy_rule.deprecate",
} as const satisfies Record<string, SystemAdminPolicyRuleAuditAction>;
