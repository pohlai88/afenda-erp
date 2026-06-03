import { getCachedModuleMetadata } from "@/lib/cached-module-metadata";
import { DashboardRoutePage } from "@/routes/workspace/dashboard/dashboard-route";
import { getErpModuleById } from "@afenda/kernel";
import type { ModuleWorkspaceSearchParams } from "@afenda/kernel";
import type { Metadata } from "next";

// Dashboard list windows read many searchParams; declare samples when re-enabling validation.
export const unstable_instant = false;

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
