import { SystemAdminSectionSkeleton } from "@/app-route-state/route-states";
import { getCachedModuleMetadata } from "@/lib/cached-module-metadata";
import { SYSTEM_ADMIN_MODULE_ID } from "@/lib/system-admin-route.shared";
import {
  createModuleMetadata,
  ModuleRoutePage,
} from "@/routes/workspace/modules/module-screen";
import { SystemAdminModuleHubSection } from "@/routes/workspace/modules/module-hub-section.server";
import {
  isCoreModuleId,
  isModuleId,
  moduleIds,
  type CoreModuleId,
  type ModuleWorkspaceSearchParams,
} from "@afenda/kernel";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export const unstable_instant = false;

type ModulePageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<ModuleWorkspaceSearchParams>;
};

function resolveModuleId(moduleId: string): CoreModuleId {
  if (!isModuleId(moduleId) || !isCoreModuleId(moduleId)) {
    notFound();
  }

  return moduleId;
}

export function generateStaticParams() {
  return moduleIds
    .filter((moduleId) => moduleId !== "dashboard")
    .map((moduleId) => ({ moduleId }));
}

const systemAdminHubMetadata: Metadata = {
  title: "System admin",
  description:
    "Tenant governance hub for identity, settings, audit, and platform controls.",
};

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { moduleId } = await params;

  if (moduleId === SYSTEM_ADMIN_MODULE_ID) {
    return systemAdminHubMetadata;
  }

  const resolvedModuleId = resolveModuleId(moduleId);
  const cachedMetadata = await getCachedModuleMetadata(resolvedModuleId);

  return cachedMetadata ?? createModuleMetadata(resolvedModuleId);
}

export default function DynamicModulePage({
  params,
  searchParams,
}: ModulePageProps) {
  return (
    <Suspense fallback={<SystemAdminSectionSkeleton />}>
      {params.then(async ({ moduleId }) => {
        if (moduleId === SYSTEM_ADMIN_MODULE_ID) {
          return (
            <SystemAdminModuleHubSection searchParams={await searchParams} />
          );
        }

        if (moduleId === "approvals") {
          redirect("/system-admin/approvals");
        }

        return (
          <ModuleRoutePage
            moduleId={resolveModuleId(moduleId)}
            searchParams={searchParams}
          />
        );
      })}
    </Suspense>
  );
}
