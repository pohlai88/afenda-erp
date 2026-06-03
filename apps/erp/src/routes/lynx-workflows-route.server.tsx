import {
  assertLynxReadAccess,
  buildLynxWorkflowSessionListPageModel,
  LYNX_WORKSPACE_ROUTES,
  type LynxRouteSearchParams,
} from "@afenda/feature-lynx/server";
import { requireWorkspaceExecutionContext } from "@/routes/execution-context-route.server";
import {
  GovernedListSection,
  LynxPageLink,
  LynxPageShell,
} from "@/routes/lynx-page-shell-route.server";

export async function LynxWorkflowsRoute({
  searchParams,
}: {
  searchParams: Promise<LynxRouteSearchParams>;
}) {
  const [context, resolvedSearchParams] = await Promise.all([
    requireWorkspaceExecutionContext(),
    searchParams,
  ]);
  assertLynxReadAccess({ capabilities: context.capabilities });
  const model = await buildLynxWorkflowSessionListPageModel({
    organizationId: context.organizationId,
    searchParams: resolvedSearchParams,
  });

  return (
    <LynxPageShell
      actions={
        <LynxPageLink href={LYNX_WORKSPACE_ROUTES.console}>Console</LynxPageLink>
      }
      description="Review proactive outcome sessions and machine-assisted workflow recovery."
      title="Workflows"
    >
      <GovernedListSection model={model.sessions} />
    </LynxPageShell>
  );
}
