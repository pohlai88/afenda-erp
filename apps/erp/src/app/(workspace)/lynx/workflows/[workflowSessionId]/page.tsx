import { LynxWorkflowSessionDetailRoutePage } from "@/workspace-routes/lynx-workflow-session-detail-route";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type PageProps = {
  params: Promise<{ workflowSessionId: string }>;
};

export default function LynxWorkflowSessionDetailPage({ params }: PageProps) {
  return <LynxWorkflowSessionDetailRoutePage params={params} />;
}
