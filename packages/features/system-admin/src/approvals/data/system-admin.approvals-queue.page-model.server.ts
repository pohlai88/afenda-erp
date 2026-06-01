import {
  getModuleWorkspace,
  resolveModuleWorkspaceListQuery,
  type ModuleDataMode,
  type ModuleWorkspaceSearchParams,
} from "@afenda/kernel";

export async function buildSystemAdminApprovalsQueuePageModel(input: {
  organizationId: string;
  dataMode: ModuleDataMode;
  searchParams?: ModuleWorkspaceSearchParams;
}) {
  const moduleQuery = resolveModuleWorkspaceListQuery(input.searchParams);
  const workspace = await getModuleWorkspace({
    organizationId: input.organizationId,
    moduleId: "approvals",
    dataMode: input.dataMode,
    query: moduleQuery,
  });

  return {
    workspace,
    moduleQuery,
  };
}
