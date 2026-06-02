export const systemAdminSecurityWebhookEvents = [
  "system-admin.security.updated",
] as const;

export const systemAdminSecurityAuditActions = {
  view: "system-admin.security.view",
  update: "system-admin.security.update",
  domainAdd: "system-admin.security.domain.add",
  domainRemove: "system-admin.security.domain.remove",
  mfaRequirementUpdate: "system-admin.security.mfa_requirement.update",
  sessionPolicyUpdate: "system-admin.security.session_policy.update",
  objectStorageProviderUpdate:
    "system-admin.security.object_storage_provider.update",
  encryptionSettingsUpdate:
    "system-admin.security.encryption_settings.update",
} as const;

export type SystemAdminSecurityWebhookEvent =
  (typeof systemAdminSecurityWebhookEvents)[number];

export type SystemAdminSecurityAuditAction =
  (typeof systemAdminSecurityAuditActions)[keyof typeof systemAdminSecurityAuditActions];
