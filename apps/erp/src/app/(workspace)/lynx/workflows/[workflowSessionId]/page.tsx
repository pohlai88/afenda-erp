import { LynxWorkflowSessionDetailRoutePage } from "@/workspace-routes/lynx-workflow-session-detail-route";
import type { WorkspaceRouteInstant } from "@/workspace-routes/workspace-route-instant";

export const unstable_instant = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;

type PageProps = {
  params: Promise<{ workflowSessionId: string }>;
};

export default function LynxWorkflowSessionDetailPage({ params }: PageProps) {
  return <LynxWorkflowSessionDetailRoutePage params={params} />;
}
