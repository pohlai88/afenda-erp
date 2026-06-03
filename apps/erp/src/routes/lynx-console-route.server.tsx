import {
  LynxOperatorPanel,
  LynxTruthPanel,
} from "@afenda/feature-lynx/client";
import {
  assertLynxReadAccess,
  buildLynxConsolePageModel,
  LYNX_WORKSPACE_ROUTES,
} from "@afenda/feature-lynx/server";
import { requireWorkspaceExecutionContext } from "@/routes/execution-context-route.server";
import {
  GovernedListSection,
  GovernedStatSection,
  LynxPageLink,
  LynxPageShell,
} from "@/routes/lynx-page-shell-route.server";

export async function LynxConsoleRoute() {
  const context = await requireWorkspaceExecutionContext();
  assertLynxReadAccess({ capabilities: context.capabilities });
  const model = await buildLynxConsolePageModel({
    organizationId: context.organizationId,
    capabilities: context.capabilities,
    sessionSource: context.sessionSource,
  });

  return (
    <LynxPageShell
      actions={
        <>
          <LynxPageLink href={LYNX_WORKSPACE_ROUTES.workflows}>
            Workflows
          </LynxPageLink>
          <LynxPageLink href={LYNX_WORKSPACE_ROUTES.runs}>Runs</LynxPageLink>
        </>
      }
      description={model.heroCopy.description}
      title={model.heroCopy.title}
    >
      <GovernedStatSection model={model.statGrid} />
      <section aria-label="Lynx AI workbench" className="split-grid">
        <LynxTruthPanel />
        <LynxOperatorPanel />
      </section>
      <div className="split-grid">
        <GovernedListSection model={model.activityLedgerList} />
        <GovernedListSection model={model.aiUsageList} />
        <GovernedListSection model={model.evidenceList} />
        <GovernedListSection model={model.playbookList} />
        <GovernedListSection model={model.skillsList} />
        {model.readiness?.moduleList ? (
          <GovernedListSection model={model.readiness.moduleList} />
        ) : null}
      </div>
    </LynxPageShell>
  );
}
