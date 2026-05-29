import {
  ensureTenantSettings as ensureTenantSettingsFromDb,
  getOrganizationProfile as getOrganizationProfileFromDb,
  getTenantSettings as getTenantSettingsFromDb,
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
