import { getCachedModuleMetadata } from "@/lib/cached-module-metadata";
import { createModuleMetadata } from "../module-screen";
import { DashboardRoutePage } from "../dashboard-route";
import {
  resolveModuleWorkspaceListQuery,
  type ModuleWorkspaceSearchParams,
} from "@afenda/domain";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cachedMetadata = await getCachedModuleMetadata("dashboard");

  return cachedMetadata ?? createModuleMetadata("dashboard");
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
