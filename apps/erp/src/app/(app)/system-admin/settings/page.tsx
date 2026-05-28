import { requireCapability } from "@afenda/auth/server";
import {
  buildTenantSettingsListSurface,
  ensureTenantSettings,
  getOrganizationProfile,
  getTenantSettings,
  systemAdminSettingsSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect, NativeSelectOption } from "@afenda/ui/native-select";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";
import { updateTenantSettingsForm } from "./actions";

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
          <form
            action={updateTenantSettingsForm}
            className="grid max-w-xl gap-4 sm:grid-cols-2"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Timezone</span>
              <Input
                name="timezone"
                defaultValue={settings?.timezone ?? "UTC"}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Locale</span>
              <Input
                name="locale"
                defaultValue={settings?.locale ?? "en-US"}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Currency</span>
              <Input
                name="currency"
                defaultValue={settings?.currency ?? "USD"}
                maxLength={3}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Fiscal year start month</span>
              <Input
                name="fiscalYearStartMonth"
                type="number"
                min={1}
                max={12}
                defaultValue={settings?.fiscalYearStartMonth ?? 1}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Data region</span>
              <Input
                name="dataRegion"
                defaultValue={settings?.dataRegion ?? "us-east-1"}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Zero data retention</span>
              <NativeSelect
                className="w-full"
                name="zdrEnabled"
                defaultValue={settings?.zdrEnabled ? "true" : "false"}
              >
                <NativeSelectOption value="false">Disabled</NativeSelectOption>
                <NativeSelectOption value="true">Enabled</NativeSelectOption>
              </NativeSelect>
            </label>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </SectionPanel>
      ) : null}
    </div>
  );
}
