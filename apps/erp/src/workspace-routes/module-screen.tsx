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
  const renderWithSearchParams = (
    section: (resolved: ModuleWorkspaceSearchParams) => ReactNode,
  ) => moduleSearchParamsSection(searchParams, section);

  return (
    <div className="flex flex-col gap-surface-2xl">
      <Suspense fallback={<ModuleScreenHeaderSkeleton />}>
        {renderWithSearchParams((resolved) => (
          <ModuleScreenHeaderSection
            moduleId={moduleId}
            searchParams={resolved}
          />
        ))}
      </Suspense>

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

      <Suspense fallback={<TwoColumnWorkspaceSkeleton />}>
        {renderWithSearchParams((resolved) => (
          <ModuleScreenPrimaryListsSection
            moduleId={moduleId}
            searchParams={resolved}
          />
        ))}
      </Suspense>

      {moduleId === "approvals" ? (
        <Suspense fallback={<GovernedListSectionSkeleton tall rows={4} />}>
          {renderWithSearchParams((resolved) => (
            <ModuleScreenKanbanSection
              moduleId={moduleId}
              searchParams={resolved}
            />
          ))}
        </Suspense>
      ) : null}

      <Suspense fallback={<TwoColumnWorkspaceSkeleton />}>
        {renderWithSearchParams((resolved) => (
          <ModuleScreenObservabilitySection
            moduleId={moduleId}
            searchParams={resolved}
          />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton tall />}>
        {renderWithSearchParams((resolved) => (
          <ModuleScreenDocumentsSection
            moduleId={moduleId}
            searchParams={resolved}
          />
        ))}
      </Suspense>

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
  );
}
