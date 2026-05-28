import {
  getModuleWorkspace,
  getModuleWorkspaceRecord,
  getModuleWorkspaceStats,
  resolveModuleWorkspaceListQuery,
  type CoreModuleId,
  type ModuleWorkspace,
  type ModuleWorkspaceListQuery,
  type ModuleWorkspaceRecordDetail,
  type ModuleWorkspaceSearchParams,
  type ModuleWorkspaceStats,
} from "@afenda/domain";

export type ResolvedModuleWorkspace = {
  workspace: ModuleWorkspace;
  moduleQuery: ModuleWorkspaceListQuery;
};

export async function resolveModuleWorkspace(input: {
  organizationId: string;
  moduleId: CoreModuleId;
  dataMode: ModuleWorkspace["dataMode"];
  searchParams?: ModuleWorkspaceSearchParams;
}): Promise<ResolvedModuleWorkspace> {
  const moduleQuery = resolveModuleWorkspaceListQuery(input.searchParams);
  const workspace = await getModuleWorkspace({
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    dataMode: input.dataMode,
    query: moduleQuery,
  });

  return {
    workspace,
    moduleQuery,
  };
}

export function getResolvedModuleWorkspaceStats(
  resolved: ResolvedModuleWorkspace,
): ModuleWorkspaceStats {
  return getModuleWorkspaceStats(resolved.workspace);
}

export async function resolveModuleRecordDetail(input: {
  organizationId: string;
  moduleId: CoreModuleId;
  recordId: string;
  dataMode: ModuleWorkspace["dataMode"];
}): Promise<ModuleWorkspaceRecordDetail | null> {
  return getModuleWorkspaceRecord({
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    recordId: input.recordId,
    dataMode: input.dataMode,
  });
}
