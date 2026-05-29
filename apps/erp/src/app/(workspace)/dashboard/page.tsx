import { getCachedModuleMetadata } from "@/lib/cached-module-metadata";
import { DashboardRoutePage } from "@/workspace-routes/dashboard-route";
import type { WorkspaceRouteInstant } from "@/workspace-routes/workspace-route-instant";
import { getErpModuleById } from "@afenda/kernel";
import type { ModuleWorkspaceSearchParams } from "@afenda/kernel";
import type { Metadata } from "next";

export const unstable_instant = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;

export async function generateMetadata(): Promise<Metadata> {
  const cachedMetadata = await getCachedModuleMetadata("dashboard");
  if (cachedMetadata) {
    return cachedMetadata;
  }

  const moduleDefinition = getErpModuleById("dashboard");

  return {
    title: moduleDefinition?.label ?? "Dashboard",
    description: moduleDefinition?.description,
  };
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<ModuleWorkspaceSearchParams>;
}) {
  return <DashboardRoutePage searchParams={searchParams} />;
}
