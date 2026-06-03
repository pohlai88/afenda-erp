import {
  assertLynxReadAccess,
  buildLynxWorkflowSessionDetailPageModel,
  LYNX_WORKSPACE_ROUTES,
} from "@afenda/feature-lynx/server";
import { notFound } from "next/navigation";
import { requireWorkspaceExecutionContext } from "../execution-context.server";
import {
  GovernedListSection,
  GovernedStatSection,
  LynxPageLink,
  LynxPageShell,
} from "./lynx-page-shell.server";

export async function LynxWorkflowDetailRoute({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [{ sessionId }, context] = await Promise.all([
    params,
    requireWorkspaceExecutionContext(),
  ]);
  assertLynxReadAccess({ capabilities: context.capabilities });
  const model = await buildLynxWorkflowSessionDetailPageModel({
    organizationId: context.organizationId,
    sessionId,
  });

  if (!model) notFound();

  return (
    <LynxPageShell
      actions={
        <LynxPageLink href={LYNX_WORKSPACE_ROUTES.workflows}>
          All workflows
        </LynxPageLink>
      }
      description={model.session.promptSummary}
      title={`Workflow ${model.session.id}`}
    >
      <GovernedStatSection model={model.overview} />
      <GovernedListSection model={model.linkedRuns} />
    </LynxPageShell>
  );
}
