import {
  assertLynxReadAccess,
  buildLynxRunDetailPageModel,
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

export async function LynxRunDetailRoute({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const [{ runId }, context] = await Promise.all([
    params,
    requireWorkspaceExecutionContext(),
  ]);
  assertLynxReadAccess({ capabilities: context.capabilities });
  const model = await buildLynxRunDetailPageModel({
    organizationId: context.organizationId,
    runId,
  });

  if (!model) notFound();

  return (
    <LynxPageShell
      actions={
        <LynxPageLink href={LYNX_WORKSPACE_ROUTES.runs}>All runs</LynxPageLink>
      }
      description={model.run.promptSummary}
      title={`Run ${model.run.id}`}
    >
      <GovernedStatSection model={model.overview} />
      <div className="split-grid">
        <GovernedListSection model={model.events} />
        <GovernedListSection model={model.feedback} />
        <GovernedListSection model={model.claims} />
      </div>
    </LynxPageShell>
  );
}
