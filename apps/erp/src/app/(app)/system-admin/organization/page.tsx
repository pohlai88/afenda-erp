import {
  buildOrganizationDefaultsListSurface,
  ensureTenantSettings,
  getOrganizationProfile,
  getTenantSettings,
  requireSystemAdminOrganizationRead,
  systemAdminOrganizationSurfaceKey,
  updateSystemAdminOrganizationDefaultsAction,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization — System admin",
  description: "Organization profile, locale, calendar, and numbering defaults.",
};

export default async function SystemAdminOrganizationPage() {
  const { organization } = await requireSystemAdminOrganizationRead();
  const canMutate =
    organization.capabilities.includes("system-admin.organization.manage") ||
    organization.capabilities.includes("system-admin.settings.write");

  await ensureTenantSettings({ organizationId: organization.id });
  const [settings, profile] = await Promise.all([
    getTenantSettings({ organizationId: organization.id }),
    getOrganizationProfile({ organizationId: organization.id }),
  ]);

  async function updateOrganization(formData: FormData) {
    "use server";
    await updateSystemAdminOrganizationDefaultsAction(undefined, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Organization"
        description="Operational organization defaults used by ERP modules and document controls."
      />

      <GovernedPatternCListSection
        title="Organization defaults"
        surfaceKey={systemAdminOrganizationSurfaceKey}
        listConfiguration={buildOrganizationDefaultsListSurface({
          settings,
          organizationName: profile?.name ?? organization.slug,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel title="Update organization defaults">
          <form action={updateOrganization} className="grid gap-3 md:grid-cols-3">
            <input name="timezone" defaultValue={settings?.timezone ?? "UTC"} className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <input name="locale" defaultValue={settings?.locale ?? "en-US"} className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <input name="currency" defaultValue={settings?.currency ?? "USD"} className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <input name="fiscalYearStartMonth" type="number" min="1" max="12" defaultValue={String(settings?.fiscalYearStartMonth ?? 1)} className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <input name="documentPrefix" defaultValue={String(settings?.documentPrefixes.default ?? "AFD")} className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <input name="numberingPrefix" defaultValue={String(settings?.numbering.defaultPrefix ?? "AFD")} className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <button className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background md:col-span-3">
              Save organization defaults
            </button>
          </form>
        </SectionPanel>
      ) : null}
    </div>
  );
}
