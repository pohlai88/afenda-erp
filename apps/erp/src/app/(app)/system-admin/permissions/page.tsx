import {
  buildPermissionsListSurface,
  requireSystemAdminPermissionsRead,
  systemAdminPermissionCatalog,
  systemAdminPermissionsSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissions — System admin",
  description: "Declared permission catalog and coverage matrix.",
};

export default async function SystemAdminPermissionsPage() {
  await requireSystemAdminPermissionsRead();

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Permissions"
        description="Permissions are declared capability contracts, not ad-hoc page flags."
      />

      <GovernedPatternCListSection
        title="Permission catalog"
        surfaceKey={systemAdminPermissionsSurfaceKey}
        listConfiguration={buildPermissionsListSurface({
          permissions: systemAdminPermissionCatalog,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
