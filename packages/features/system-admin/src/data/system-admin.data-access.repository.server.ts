import {
  ensureTenantSettings as ensureTenantSettingsFromDb,
  getOrganizationProfile as getOrganizationProfileFromDb,
  getTenantSettings as getTenantSettingsFromDb,
  listApiCredentials as listApiCredentialsFromDb,
  listAuditLogsForOrganization as listAuditLogsForOrganizationFromDb,
  listAiUsageEvents as listAiUsageEventsFromDb,
  getTenantSecuritySettings as getTenantSecuritySettingsFromDb,
  ensureTenantSecuritySettings as ensureTenantSecuritySettingsFromDb,
  listTenantApprovalSettings as listTenantApprovalSettingsFromDb,
  listTenantModuleSettings as listTenantModuleSettingsFromDb,
  listTenantPolicySettings as listTenantPolicySettingsFromDb,
  listOrganizationInvitations as listOrganizationInvitationsFromDb,
  listRetentionPolicies as listRetentionPoliciesFromDb,
  listRoleOverridesForOrganization as listRoleOverridesForOrganizationFromDb,
  listSsoConnections as listSsoConnectionsFromDb,
  listTenantMembers as listTenantMembersFromDb,
  listWebhookDeliveries as listWebhookDeliveriesFromDb,
  listWebhooks as listWebhooksFromDb,
} from "@afenda/db";

export function ensureTenantSettings(
  input: Parameters<typeof ensureTenantSettingsFromDb>[0],
) {
  return ensureTenantSettingsFromDb(input);
}

export function getOrganizationProfile(
  input: Parameters<typeof getOrganizationProfileFromDb>[0],
) {
  return getOrganizationProfileFromDb(input);
}

export function getTenantSettings(
  input: Parameters<typeof getTenantSettingsFromDb>[0],
) {
  return getTenantSettingsFromDb(input);
}

export function ensureTenantSecuritySettings(
  input: Parameters<typeof ensureTenantSecuritySettingsFromDb>[0],
) {
  return ensureTenantSecuritySettingsFromDb(input);
}

export function getTenantSecuritySettings(
  input: Parameters<typeof getTenantSecuritySettingsFromDb>[0],
) {
  return getTenantSecuritySettingsFromDb(input);
}

export function listApiCredentials(
  input: Parameters<typeof listApiCredentialsFromDb>[0],
) {
  return listApiCredentialsFromDb(input);
}

export function listAuditLogsForOrganization(
  input: Parameters<typeof listAuditLogsForOrganizationFromDb>[0],
) {
  return listAuditLogsForOrganizationFromDb(input);
}

export function listAiUsageEvents(
  input: Parameters<typeof listAiUsageEventsFromDb>[0],
) {
  return listAiUsageEventsFromDb(input);
}

export function listOrganizationInvitations(
  input: Parameters<typeof listOrganizationInvitationsFromDb>[0],
) {
  return listOrganizationInvitationsFromDb(input);
}

export function listRetentionPolicies(
  input: Parameters<typeof listRetentionPoliciesFromDb>[0],
) {
  return listRetentionPoliciesFromDb(input);
}

export function listRoleOverridesForOrganization(
  input: Parameters<typeof listRoleOverridesForOrganizationFromDb>[0],
) {
  return listRoleOverridesForOrganizationFromDb(input);
}

export function listSsoConnections(
  input: Parameters<typeof listSsoConnectionsFromDb>[0],
) {
  return listSsoConnectionsFromDb(input);
}

export function listTenantMembers(
  input: Parameters<typeof listTenantMembersFromDb>[0],
) {
  return listTenantMembersFromDb(input);
}

export function listTenantModuleSettings(
  input: Parameters<typeof listTenantModuleSettingsFromDb>[0],
) {
  return listTenantModuleSettingsFromDb(input);
}

export function listTenantPolicySettings(
  input: Parameters<typeof listTenantPolicySettingsFromDb>[0],
) {
  return listTenantPolicySettingsFromDb(input);
}

export function listTenantApprovalSettings(
  input: Parameters<typeof listTenantApprovalSettingsFromDb>[0],
) {
  return listTenantApprovalSettingsFromDb(input);
}

export function listWebhookDeliveries(
  input: Parameters<typeof listWebhookDeliveriesFromDb>[0],
) {
  return listWebhookDeliveriesFromDb(input);
}

export function listWebhooks(input: Parameters<typeof listWebhooksFromDb>[0]) {
  return listWebhooksFromDb(input);
}
