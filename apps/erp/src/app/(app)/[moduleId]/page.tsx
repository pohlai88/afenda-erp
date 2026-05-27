import { createModuleMetadata, ModuleRoutePage } from "../module-screen";
import { getCachedModuleMetadata } from "@/lib/cached-module-metadata";
import {
  isModuleId,
  moduleIds,
  resolveModuleWorkspaceListQuery,
  type ModuleId,
  type ModuleWorkspaceSearchParams,
} from "@afenda/domain";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ModulePageProps = {
  params: Promise<{ moduleId: string }>;
  searchParams?: Promise<ModuleWorkspaceSearchParams>;
};

function resolveModuleId(moduleId: string): ModuleId {
  if (!isModuleId(moduleId) || moduleId === "dashboard") {
    notFound();
  }

  return moduleId;
}

export function generateStaticParams() {
  return moduleIds
    .filter((moduleId) => moduleId !== "dashboard")
    .map((moduleId) => ({ moduleId }));
}

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { moduleId } = await params;
  const resolvedModuleId = resolveModuleId(moduleId);
  const cachedMetadata = await getCachedModuleMetadata(resolvedModuleId);

  return cachedMetadata ?? createModuleMetadata(resolvedModuleId);
}

export default async function DynamicModulePage({
  params,
  searchParams,
}: ModulePageProps) {
  const { moduleId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  return (
    <ModuleRoutePage
      moduleId={resolveModuleId(moduleId)}
      query={resolveModuleWorkspaceListQuery(resolvedSearchParams)}
    />
  );
}
