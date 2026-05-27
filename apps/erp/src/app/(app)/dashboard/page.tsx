import { getCachedModuleMetadata } from "@/lib/cached-module-metadata";
import { DashboardRoutePage } from "../dashboard-route";
import {
  getErpModuleById,
  resolveModuleWorkspaceListQuery,
  type ModuleWorkspaceSearchParams,
} from "@afenda/domain";
import type { Metadata } from "next";

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<ModuleWorkspaceSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return (
    <DashboardRoutePage
      query={resolveModuleWorkspaceListQuery(resolvedSearchParams)}
    />
  );
}
