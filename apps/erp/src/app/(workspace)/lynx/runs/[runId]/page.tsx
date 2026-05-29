import { LynxRunDetailRoutePage } from "@/workspace-routes/lynx-run-detail-route";
import type { WorkspaceRouteInstant } from "@/workspace-routes/workspace-route-instant";

export const unstable_instant = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default function LynxRunDetailPage({ params }: PageProps) {
  return <LynxRunDetailRoutePage params={params} />;
}
