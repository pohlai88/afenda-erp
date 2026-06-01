import {
  AppSubLayout,
  AppShellSurface,
  type AppShellPrimaryLeftRailConfig,
} from "@afenda/appshell";
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

const dashboardSubLayoutRail: AppShellPrimaryLeftRailConfig = {
  storageKey: "dashboard-sub-layout",
  identity: {
    initials: "DB",
    primary: "Dashboard",
  },
  labels: {
    ariaLabel: "Dashboard sections",
    searchPlaceholder: "Filter sections",
    searchAriaLabel: "Filter dashboard sections",
    emptyState: "No matching dashboard sections.",
  },
  sections: [
    {
      id: "overview",
      label: "Overview",
        items: [
        { id: "dashboard-summary", label: "Summary", href: "/dashboard#dashboard-summary", icon: "layout-dashboard" },
        { id: "dashboard-kpis", label: "KPIs", href: "/dashboard#dashboard-kpis", icon: "activity" },
        { id: "dashboard-queues", label: "Queues", href: "/dashboard#dashboard-queues", icon: "list" },
      ],
    },
    {
      id: "governance",
      label: "Governance",
        items: [
        { id: "dashboard-hardening", label: "Hardening", href: "/dashboard#dashboard-hardening", icon: "shield-check" },
        { id: "dashboard-saved-views", label: "Saved views", href: "/dashboard#dashboard-saved-views", icon: "list" },
        { id: "dashboard-modules", label: "Modules", href: "/dashboard#dashboard-modules", icon: "grid-3x3" },
      ],
    },
  ],
};

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
    <AppSubLayout
      contextPatch={{
        surface: {
          id: "dashboard",
          label: "Dashboard",
          href: "/dashboard",
        },
      }}
      rail={dashboardSubLayoutRail}
    >
      <AppShellSurface breadcrumbs={[{ label: "Workspace", href: "/dashboard" }, { label: "Dashboard" }]}>
        <div className="flex flex-col gap-surface-2xl">
          <div id="dashboard-summary">
            <Suspense fallback={<ModuleScreenHeaderSkeleton statCount={3} />}>
              {renderWithQuery((listQuery) => (
                <DashboardHeaderSection query={listQuery} />
              ))}
            </Suspense>
          </div>

          <div id="dashboard-kpis">
            <Suspense fallback={<GovernedStatSectionSkeleton statCount={3} layout="embedded" />}>
              {renderWithQuery((listQuery) => (
                <DashboardKpiSection query={listQuery} />
              ))}
            </Suspense>
          </div>

          <div id="dashboard-queues">
            <Suspense fallback={<DashboardPriorityColumnSkeleton />}>
              {renderWithQuery((listQuery) => (
                <DashboardWorkflowColumnSection query={listQuery} />
              ))}
            </Suspense>
          </div>

          <Suspense fallback={<GovernedListSectionSkeleton rows={4} />}>
            {renderWithQuery((listQuery) => (
              <DashboardAssistantSection query={listQuery} />
            ))}
          </Suspense>

          <div id="dashboard-hardening">
            <Suspense fallback={<DashboardHardeningSectionSkeleton />}>
              <DashboardHardeningSection />
            </Suspense>
          </div>

          <div id="dashboard-saved-views">
            <Suspense fallback={<GovernedListSectionSkeleton rows={4} />}>
              {renderWithQuery((listQuery) => (
                <DashboardSavedViewsSection query={listQuery} />
              ))}
            </Suspense>
          </div>

          <div id="dashboard-modules">
            <Suspense fallback={<GovernedListSectionSkeleton rows={3} />}>
              <DashboardModulesSection />
            </Suspense>
          </div>
        </div>
      </AppShellSurface>
    </AppSubLayout>
  );
}
