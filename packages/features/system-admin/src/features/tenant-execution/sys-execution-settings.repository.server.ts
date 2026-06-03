import {
  listTenantApprovalSettings as listTenantApprovalSettingsFromDb,
  listTenantCapabilitySettings as listTenantCapabilitySettingsFromDb,
  listTenantModuleSettings as listTenantModuleSettingsFromDb,
  listTenantPolicySettings as listTenantPolicySettingsFromDb,
  upsertTenantApprovalSettings as upsertTenantApprovalSettingsFromDb,
} from "@afenda/db";

export function listTenantModuleSettings(
  input: Parameters<typeof listTenantModuleSettingsFromDb>[0],
) {
  return listTenantModuleSettingsFromDb(input);
}

export function listTenantCapabilitySettings(
  input: Parameters<typeof listTenantCapabilitySettingsFromDb>[0],
) {
  return listTenantCapabilitySettingsFromDb(input);
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

export function upsertTenantApprovalSettings(
  input: Parameters<typeof upsertTenantApprovalSettingsFromDb>[0],
) {
  return upsertTenantApprovalSettingsFromDb(input);
}
