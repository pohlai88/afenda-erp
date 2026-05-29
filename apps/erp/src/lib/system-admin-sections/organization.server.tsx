import {
  buildOrganizationDefaultsListSurface,
  systemAdminOrganizationSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminOrganizationPageModel,
  requireSystemAdminOrganizationRead,
  updateSystemAdminOrganizationDefaultsAction,
} from "@afenda/feature-system-admin/server";
import { SystemAdminOrganizationDefaultsForm } from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization - System admin",
  description: "Organization profile, locale, calendar, numbering, and data-handling defaults.",
};

export default async function SystemAdminOrganizationPage() {
  const { organization } = await requireSystemAdminOrganizationRead();
  const canMutate =
    organization.capabilities.includes("system-admin.organization.manage") ||
    organization.capabilities.includes("system-admin.settings.write");

  const pageModel = await buildSystemAdminOrganizationPageModel({
    organizationId: organization.id,
    organizationSlug: organization.slug,
  });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title="Organization"
        description="Operational organization defaults used by ERP modules, document controls, and tenant data-handling policy."
      />

      <GovernedPatternCListSection
        title="Organization defaults"
        surfaceKey={systemAdminOrganizationSurfaceKey}
        listConfiguration={buildOrganizationDefaultsListSurface({
          settings: pageModel.settings,
          organizationName: pageModel.organizationName,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {canMutate ? (
        <SectionPanel
          title="Update organization defaults"
          description="Changes are audited as system-admin.organization.update and apply tenant-wide operational, document, and data-handling settings."
        >
          <SystemAdminOrganizationDefaultsForm
            defaults={pageModel.formDefaults}
            updateOrganizationDefaultsAction={
              updateSystemAdminOrganizationDefaultsAction
            }
          />
        </SectionPanel>
      ) : null}
    </div>
  );
}
