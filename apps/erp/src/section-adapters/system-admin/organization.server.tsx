import {
  buildOrganizationDefaultsListSurface,
  systemAdminOrganizationSurfaceKey,
  systemAdminOrganizationUiCopy,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminOrganizationPageModel,
  requireSystemAdminOrganizationRead,
  SystemAdminOrganizationAccessDenied,
  updateSystemAdminOrganizationDefaultsAction,
} from "@afenda/feature-system-admin/server";
import { SystemAdminOrganizationDefaultsForm } from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization — System admin",
  description: systemAdminOrganizationUiCopy.page.description,
};

export default async function SystemAdminOrganizationPage() {
  let organization: Awaited<
    ReturnType<typeof requireSystemAdminOrganizationRead>
  >["organization"];

  try {
    ({ organization } = await requireSystemAdminOrganizationRead());
  } catch {
    return <SystemAdminOrganizationAccessDenied />;
  }

  const canMutate =
    organization.capabilities.includes("system-admin.organization.manage") ||
    organization.capabilities.includes("system-admin.settings.write");

  const pageModel = await buildSystemAdminOrganizationPageModel({
    organizationId: organization.id,
    organizationSlug: organization.slug,
  });

  const copy = systemAdminOrganizationUiCopy;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      <GovernedPatternCListSection
        title={copy.list.title}
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
          title={copy.form.title}
          description={copy.form.description}
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
