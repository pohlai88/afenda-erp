import {
  ensureTenantSecuritySettings as ensureTenantSecuritySettingsFromDb,
  getTenantSecuritySettings as getTenantSecuritySettingsFromDb,
} from "@afenda/db";

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
