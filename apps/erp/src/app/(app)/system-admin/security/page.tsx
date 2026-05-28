import {
  buildSecuritySettingsListSurface,
  ensureTenantSecuritySettings,
  getTenantSecuritySettings,
  requireSystemAdminSecurityRead,
  systemAdminSecuritySurfaceKey,
  updateSystemAdminSecurityAction,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — System admin",
  description: "Tenant security posture and sensitive-action controls.",
};

export default async function SystemAdminSecurityPage() {
  const { organization } = await requireSystemAdminSecurityRead();
  const canMutate =
    organization.capabilities.includes("system-admin.security.manage") ||
    organization.capabilities.includes("system-admin.settings.write");

  await ensureTenantSecuritySettings({ organizationId: organization.id });
  const security = await getTenantSecuritySettings({
    organizationId: organization.id,
  });

  async function updateSecurity(formData: FormData) {
    "use server";
    await updateSystemAdminSecurityAction(undefined, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Security"
        description="Tenant security settings are durable, audited, and separate from low-level auth implementation."
      />

      <GovernedPatternCListSection
        title="Security posture"
        surfaceKey={systemAdminSecuritySurfaceKey}
        listConfiguration={buildSecuritySettingsListSurface({ security })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel title="Update security settings">
          <form action={updateSecurity} className="grid gap-3 md:grid-cols-4">
            <select name="mfaRequired" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue={security?.mfaRequired ? "true" : "false"}>
              <option value="false">MFA optional</option>
              <option value="true">MFA required</option>
            </select>
            <input name="trustedDomains" placeholder="example.com, afenda.com" defaultValue={security?.trustedDomains.join(", ") ?? ""} className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <select name="sensitiveActionConfirmation" className="rounded-md border border-line bg-background px-3 py-2 text-sm" defaultValue={security?.sensitiveActionConfirmation === false ? "false" : "true"}>
              <option value="true">Confirm sensitive actions</option>
              <option value="false">Do not require confirmation</option>
            </select>
            <input name="sessionTimeoutMinutes" type="number" min="15" max="1440" defaultValue={String(security?.sessionPolicy.sessionTimeoutMinutes ?? 720)} className="rounded-md border border-line bg-background px-3 py-2 text-sm" />
            <button className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background md:col-span-4">
              Save security settings
            </button>
          </form>
        </SectionPanel>
      ) : null}
    </div>
  );
}
