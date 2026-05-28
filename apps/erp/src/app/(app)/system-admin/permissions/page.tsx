import {
  buildPermissionsListSurface,
  systemAdminPermissionsSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminPermissionsPageModel,
  requireSystemAdminPermissionsRead,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissions — System admin",
  description: "Declared permission catalog and coverage matrix.",
};

export default async function SystemAdminPermissionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { context, organization } = await requireSystemAdminPermissionsRead();
  const { searchValue, permissions } = await buildSystemAdminPermissionsPageModel(
    {
      organizationId: organization.id,
      actorId: context.userId,
      actorType: context.actorType,
      searchParams: resolvedSearchParams,
    },
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Permissions"
        description="Permissions are declared capability contracts grouped by module. Orphan and unused permissions are flagged for review."
      />

      <GovernedPatternCListSection
        title="Permission catalog"
        surfaceKey={systemAdminPermissionsSurfaceKey}
        listConfiguration={buildPermissionsListSurface({
          searchValue,
          permissions,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
