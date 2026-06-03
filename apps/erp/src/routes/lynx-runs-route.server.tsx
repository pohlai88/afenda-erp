import {
  assertLynxReadAccess,
  buildLynxRunManagementPageModel,
  LYNX_WORKSPACE_ROUTES,
  type LynxRouteSearchParams,
} from "@afenda/feature-lynx/server";
import { requireWorkspaceExecutionContext } from "@/routes/execution-context-route.server";
import {
  GovernedListSection,
  GovernedStatSection,
  LynxPageLink,
  LynxPageShell,
} from "@/routes/lynx-page-shell-route.server";

export async function LynxRunsRoute({
  searchParams,
}: {
  searchParams: Promise<LynxRouteSearchParams>;
}) {
  const [context, resolvedSearchParams] = await Promise.all([
    requireWorkspaceExecutionContext(),
    searchParams,
  ]);
  assertLynxReadAccess({ capabilities: context.capabilities });
  const model = await buildLynxRunManagementPageModel({
    organizationId: context.organizationId,
    searchParams: resolvedSearchParams,
  });

  return (
    <LynxPageShell
      actions={
        <LynxPageLink href={LYNX_WORKSPACE_ROUTES.console}>Console</LynxPageLink>
      }
      description="Inspect tenant-scoped Lynx operator and truth retrieval runs."
      title="Runs"
    >
      <GovernedStatSection model={model.overview} title="Run health" />
      <GovernedStatSection model={model.quality} title="Quality signals" />
      <GovernedListSection model={model.runs} />
    </LynxPageShell>
  );
}
