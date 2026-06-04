import {
  ensureTenantSettings,
  getOrganizationProfile,
  getTenantSettings,
} from "./sys-tenant-settings.repository.server";
import type {
  SystemAdminOrganizationDefaults,
  SystemAdminOrganizationPageModel,
} from "./sys-organization.contract";

function toOrganizationDefaults(
  settings: Awaited<ReturnType<typeof getTenantSettings>>,
): SystemAdminOrganizationDefaults {
  return {
    timezone: settings?.timezone ?? "UTC",
    locale: settings?.locale ?? "en-US",
    currency: settings?.currency ?? "USD",
    fiscalYearStartMonth: settings?.fiscalYearStartMonth ?? 1,
    documentPrefix: String(settings?.documentPrefixes.default ?? "AFD"),
    numberingPrefix: String(settings?.numbering.defaultPrefix ?? "AFD"),
    dataRegion: settings?.dataRegion ?? "us-east-1",
    zdrEnabled: settings?.zdrEnabled ?? false,
  };
}

export async function buildSystemAdminOrganizationPageModel(input: {
  organizationId: string;
  organizationSlug: string;
}): Promise<SystemAdminOrganizationPageModel> {
  await ensureTenantSettings({ organizationId: input.organizationId });

  const [settings, profile] = await Promise.all([
    getTenantSettings({ organizationId: input.organizationId }),
    getOrganizationProfile({ organizationId: input.organizationId }),
  ]);

  const organizationName = profile?.name ?? input.organizationSlug;

  return {
    settings,
    profile: profile ? { name: profile.name } : null,
    organizationName,
    formDefaults: toOrganizationDefaults(settings),
  };
}
