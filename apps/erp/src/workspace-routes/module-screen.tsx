import {
  AppSubLayout,
  AppShellSurface,
  type AppShellPrimaryLeftRailConfig,
} from "@afenda/appshell";
import {
  type CoreModuleId,
  type ModuleWorkspaceSearchParams,
} from "@afenda/kernel";
import {
  ModuleScreenDocumentsSection,
  ModuleScreenFooterSection,
  ModuleScreenHeaderSection,
  ModuleScreenKanbanSection,
  ModuleScreenMetricsSection,
  ModuleScreenObservabilitySection,
  ModuleScreenPrimaryListsSection,
} from "@/workspace-routes/module-screen-sections.server";
import {
  GovernedListSectionSkeleton,
  GovernedStatSectionSkeleton,
  ModuleScreenHeaderSkeleton,
  TwoColumnWorkspaceSkeleton,
} from "@/workspace-routes/workspace-section-skeletons";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getErpModuleById } from "@afenda/kernel";

function getModuleOrThrow(moduleId: CoreModuleId) {
  const moduleDefinition = getErpModuleById(moduleId);

  if (!moduleDefinition) {
    notFound();
  }

  return moduleDefinition;
}

export function createModuleMetadata(moduleId: CoreModuleId): Metadata {
  const moduleDefinition = getModuleOrThrow(moduleId);

  return {
    title: moduleDefinition.label,
    description: moduleDefinition.description,
  };
}

function moduleSearchParamsSection(
  searchParams: Promise<ModuleWorkspaceSearchParams> | undefined,
  render: (resolved: ModuleWorkspaceSearchParams) => ReactNode,
) {
  return (searchParams ?? Promise.resolve({})).then(render);
}

export function ModuleRoutePage({
  moduleId,
  searchParams,
}: {
  moduleId: CoreModuleId;
  searchParams?: Promise<ModuleWorkspaceSearchParams>;
}) {
  const moduleDefinition = getModuleOrThrow(moduleId);
  const renderWithSearchParams = (
    section: (resolved: ModuleWorkspaceSearchParams) => ReactNode,
  ) => moduleSearchParamsSection(searchParams, section);

  return (
    <AppSubLayout
      contextPatch={{
        surface: {
          id: moduleDefinition.id,
          label: moduleDefinition.label,
          description: moduleDefinition.summary,
          href: moduleDefinition.href,
        },
      }}
      rail={buildModuleSubLayoutRail(moduleDefinition)}
    >
      <AppShellSurface
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: moduleDefinition.label },
        ]}
      >
        <div className="flex flex-col gap-surface-2xl">
          <div id="module-summary">
            <Suspense fallback={<ModuleScreenHeaderSkeleton />}>
              {renderWithSearchParams((resolved) => (
                <ModuleScreenHeaderSection
                  moduleId={moduleId}
                  searchParams={resolved}
                />
              ))}
            </Suspense>
          </div>

          <div id="module-metrics">
            <Suspense
              fallback={
                <>
                  <GovernedStatSectionSkeleton statCount={4} />
                  <GovernedStatSectionSkeleton statCount={3} />
                </>
              }
            >
              {renderWithSearchParams((resolved) => (
                <div className="flex flex-col gap-surface-2xl">
                  <ModuleScreenMetricsSection
                    moduleId={moduleId}
                    searchParams={resolved}
                  />
                </div>
              ))}
            </Suspense>
          </div>

          <div id="module-primary">
            <Suspense fallback={<TwoColumnWorkspaceSkeleton />}>
              {renderWithSearchParams((resolved) => (
                <ModuleScreenPrimaryListsSection
                  moduleId={moduleId}
                  searchParams={resolved}
                />
              ))}
            </Suspense>
          </div>

          {moduleId === "approvals" ? (
            <div id="module-workflow">
              <Suspense fallback={<GovernedListSectionSkeleton tall rows={4} />}>
                {renderWithSearchParams((resolved) => (
                  <ModuleScreenKanbanSection
                    moduleId={moduleId}
                    searchParams={resolved}
                  />
                ))}
              </Suspense>
            </div>
          ) : null}

          <div id="module-observability">
            <Suspense fallback={<TwoColumnWorkspaceSkeleton />}>
              {renderWithSearchParams((resolved) => (
                <ModuleScreenObservabilitySection
                  moduleId={moduleId}
                  searchParams={resolved}
                />
              ))}
            </Suspense>
          </div>

          <div id="module-documents">
            <Suspense fallback={<GovernedListSectionSkeleton tall />}>
              {renderWithSearchParams((resolved) => (
                <ModuleScreenDocumentsSection
                  moduleId={moduleId}
                  searchParams={resolved}
                />
              ))}
            </Suspense>
          </div>

          <div id="module-connected">
            <Suspense
              fallback={
                <>
                  <GovernedListSectionSkeleton rows={3} />
                  <GovernedListSectionSkeleton rows={3} />
                </>
              }
            >
              {renderWithSearchParams((resolved) => (
                <ModuleScreenFooterSection
                  moduleId={moduleId}
                  searchParams={resolved}
                />
              ))}
            </Suspense>
          </div>
        </div>
      </AppShellSurface>
    </AppSubLayout>
  );
}

function buildModuleSubLayoutRail(
  moduleDefinition: ReturnType<typeof getModuleOrThrow>,
): AppShellPrimaryLeftRailConfig {
  return {
    storageKey: `${moduleDefinition.id}-sub-layout`,
    identity: {
      initials: moduleDefinition.label.slice(0, 2).toUpperCase(),
      primary: moduleDefinition.label,
    },
    labels: {
      ariaLabel: `${moduleDefinition.label} sections`,
      searchPlaceholder: "Filter sections",
      searchAriaLabel: `Filter ${moduleDefinition.label} sections`,
      emptyState: "No matching sections in this workspace.",
    },
    sections: [
      {
        id: "overview",
        label: "Overview",
        items: [
          { id: "summary", label: "Summary", href: `${moduleDefinition.href}#module-summary`, icon: "layout-dashboard" },
          { id: "metrics", label: "Metrics", href: `${moduleDefinition.href}#module-metrics`, icon: "activity" },
          { id: "records", label: "Records", href: `${moduleDefinition.href}#module-primary`, icon: "list" },
        ],
      },
      {
        id: "operations",
        label: "Operations",
        items: [
          { id: "observability", label: "Observability", href: `${moduleDefinition.href}#module-observability`, icon: "scan-search" },
          { id: "documents", label: "Documents", href: `${moduleDefinition.href}#module-documents`, icon: "file-text" },
          { id: "connected", label: "Connected", href: `${moduleDefinition.href}#module-connected`, icon: "building-2" },
        ],
      },
    ],
  };
}

