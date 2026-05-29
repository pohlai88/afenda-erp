import { LynxWorkflowsRoutePage } from "@/workspace-routes/lynx-workflows-route";
import type { WorkspaceRouteInstant } from "@/workspace-routes/workspace-route-instant";

export const unstable_instant = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;

type LynxWorkflowsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function LynxWorkflowsPage({ searchParams }: LynxWorkflowsPageProps) {
  return <LynxWorkflowsRoutePage searchParams={searchParams} />;
}
