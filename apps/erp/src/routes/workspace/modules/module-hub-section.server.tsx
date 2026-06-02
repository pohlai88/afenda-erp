import {
  getSystemAdminOverview,
  requireSystemAdminRead,
  SystemAdminOverviewPage,
} from "@afenda/feature-system-admin/server";
import type { ModuleWorkspaceSearchParams } from "@afenda/kernel";
import { Suspense } from "react";

import { ModuleScreenDocumentsSection } from "@/routes/workspace/modules/module-screen-sections.server";
import { GovernedListSectionSkeleton } from "@/routes/workspace/shared/workspace-section-skeletons";

export async function SystemAdminModuleHubSection({
  searchParams,
}: {
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const { organization } = await requireSystemAdminRead();
  const snapshot = await getSystemAdminOverview({
    organizationId: organization.id,
  });

  return (
    <div className="flex flex-col gap-surface-xl">
      <SystemAdminOverviewPage snapshot={snapshot} />
      <div id="module-documents">
        <Suspense fallback={<GovernedListSectionSkeleton tall />}>
          <ModuleScreenDocumentsSection
            moduleId="system-admin"
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}
