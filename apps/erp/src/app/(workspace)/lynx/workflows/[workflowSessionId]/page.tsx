import { LynxWorkflowSessionDetailRoutePage } from "@/routes/workspace/lynx/lynx-workflow-session-detail-route";

export const unstable_instant = false;

type PageProps = {
  params: Promise<{ workflowSessionId: string }>;
};

export default function LynxWorkflowSessionDetailPage({ params }: PageProps) {
  return <LynxWorkflowSessionDetailRoutePage params={params} />;
}
