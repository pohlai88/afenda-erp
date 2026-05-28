export const systemAdminSecurityWebhookEvents = [
  "system-admin.security.updated",
] as const;

export const systemAdminSecurityAuditActions = {
  update: "system-admin.security.update",
  domainAdd: "system-admin.security.domain.add",
  domainRemove: "system-admin.security.domain.remove",
  mfaRequirementUpdate: "system-admin.security.mfa_requirement.update",
  sessionPolicyUpdate: "system-admin.security.session_policy.update",
} as const;

export type SystemAdminSecurityWebhookEvent =
  (typeof systemAdminSecurityWebhookEvents)[number];

export type SystemAdminSecurityAuditAction =
  (typeof systemAdminSecurityAuditActions)[keyof typeof systemAdminSecurityAuditActions];
