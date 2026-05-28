import type { TenantSettingsSnapshot } from "@afenda/db";

export type SystemAdminOrganizationProfile = {
  name: string;
};

export type SystemAdminOrganizationDefaults = {
  timezone: string;
  locale: string;
  currency: string;
  fiscalYearStartMonth: number;
  documentPrefix: string;
  numberingPrefix: string;
};

export type SystemAdminOrganizationPageModel = {
  settings: TenantSettingsSnapshot | null;
  profile: SystemAdminOrganizationProfile | null;
  organizationName: string;
  formDefaults: SystemAdminOrganizationDefaults;
};
