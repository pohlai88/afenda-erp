import { requireCapability } from "@afenda/auth/server";
import {
  buildTenantSettingsListSurface,
  ensureTenantSettings,
  getOrganizationProfile,
  getTenantSettings,
  systemAdminSettingsSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";
import { TenantSettingsForm } from "@/components/system-admin/tenant-settings-form.client";

export const metadata: Metadata = {
  title: "Settings — System admin",
  description: "Tenant profile, locale, timezone, and data-handling policy.",
};

export default async function SystemAdminSettingsPage() {
  const { organization } = await requireCapability(
    "system-admin.settings.read",
  );
  const canWrite = organization.capabilities.includes(
    "system-admin.settings.write",
  );

  await ensureTenantSettings({ organizationId: organization.id });

  const [settings, profile] = await Promise.all([
    getTenantSettings({ organizationId: organization.id }),
    getOrganizationProfile({ organizationId: organization.id }),
  ]);

  const settingsSurface = buildTenantSettingsListSurface({
    settings,
    organizationName: profile?.name ?? organization.name,
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Tenant settings"
        description="Operational profile for the active organization."
      />

      <GovernedPatternCListSection
        title="Current values"
        surfaceKey={systemAdminSettingsSurfaceKey}
        listConfiguration={settingsSurface}
        parentAccessAllowed
        layout="embedded"
      />

      {canWrite ? (
        <SectionPanel
          title="Update settings"
          description="Changes are audited as tenant.settings.updated."
        >
          <TenantSettingsForm
            defaults={{
              timezone: settings?.timezone ?? "UTC",
              locale: settings?.locale ?? "en-US",
              currency: settings?.currency ?? "USD",
              fiscalYearStartMonth: settings?.fiscalYearStartMonth ?? 1,
              dataRegion: settings?.dataRegion ?? "us-east-1",
              zdrEnabled: settings?.zdrEnabled ?? false,
            }}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
