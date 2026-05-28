import {
  buildSystemAdminSecuritySettingsListSurface,
  systemAdminSecuritySurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  getSystemAdminOrganizationSecuritySettings,
  requireSystemAdminSecurityRead,
  updateSystemAdminSecuritySettingsAction,
} from "@afenda/feature-system-admin/server";
import { SystemAdminSecurityForm } from "@afenda/feature-system-admin/client";
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

  const security = await getSystemAdminOrganizationSecuritySettings({
    organizationId: organization.id,
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Security"
        description="Organization-level security posture. Sensitive changes are guarded, scoped, and audited."
      />

      <GovernedPatternCListSection
        title="Security posture"
        surfaceKey={systemAdminSecuritySurfaceKey}
        listConfiguration={buildSystemAdminSecuritySettingsListSurface({
          security,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate && security ? (
        <SectionPanel
          title="Update security settings"
          description="Dangerous downgrades require explicit confirmation. Domain and session values are validated server-side."
        >
          <SystemAdminSecurityForm
            security={security}
            updateSecuritySettingsAction={updateSystemAdminSecuritySettingsAction}
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
