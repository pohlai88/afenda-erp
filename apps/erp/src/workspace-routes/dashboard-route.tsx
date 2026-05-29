import {
  resolveModuleWorkspaceListQuery,
  type ModuleWorkspaceListQuery,
  type ModuleWorkspaceSearchParams,
} from "@afenda/kernel";
import {
  DashboardAssistantSection,
  DashboardHeaderSection,
  DashboardHardeningSection,
  DashboardKpiSection,
  DashboardModulesSection,
  DashboardSavedViewsSection,
  DashboardWorkflowColumnSection,
} from "@/workspace-routes/dashboard-sections.server";
import {
  DashboardHardeningSectionSkeleton,
  DashboardPriorityColumnSkeleton,
  GovernedListSectionSkeleton,
  GovernedStatSectionSkeleton,
  ModuleScreenHeaderSkeleton,
} from "@/workspace-routes/workspace-section-skeletons";
import { Suspense, type ReactNode } from "react";

function dashboardQuerySection(
  searchParams: Promise<ModuleWorkspaceSearchParams> | undefined,
  render: (query: ModuleWorkspaceListQuery) => ReactNode,
) {
  return (searchParams ?? Promise.resolve({})).then((resolved) =>
    render(resolveModuleWorkspaceListQuery(resolved)),
  );
}

export function DashboardRoutePage({
  query,
  searchParams,
}: {
  query?: ModuleWorkspaceListQuery;
  searchParams?: Promise<ModuleWorkspaceSearchParams>;
}) {
  const renderWithQuery = (section: (listQuery: ModuleWorkspaceListQuery) => ReactNode) => {
    if (query !== undefined) {
      return section(query);
    }

    return dashboardQuerySection(searchParams, section);
  };

  return (
    <div className="flex flex-col gap-surface-2xl">
      <Suspense fallback={<ModuleScreenHeaderSkeleton statCount={3} />}>
        {renderWithQuery((listQuery) => (
          <DashboardHeaderSection query={listQuery} />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedStatSectionSkeleton statCount={3} layout="embedded" />}>
        {renderWithQuery((listQuery) => (
          <DashboardKpiSection query={listQuery} />
        ))}
      </Suspense>

      <Suspense fallback={<DashboardPriorityColumnSkeleton />}>
        {renderWithQuery((listQuery) => (
          <DashboardWorkflowColumnSection query={listQuery} />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={4} />}>
        {renderWithQuery((listQuery) => (
          <DashboardAssistantSection query={listQuery} />
        ))}
      </Suspense>

      <Suspense fallback={<DashboardHardeningSectionSkeleton />}>
        <DashboardHardeningSection />
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={4} />}>
        {renderWithQuery((listQuery) => (
          <DashboardSavedViewsSection query={listQuery} />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={3} />}>
        <DashboardModulesSection />
      </Suspense>
    </div>
  );
}
