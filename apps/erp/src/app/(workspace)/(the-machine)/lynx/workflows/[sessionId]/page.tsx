import type { Metadata } from "next";
import { LynxWorkflowDetailRoute } from "@/workspace-routes/lynx/lynx-workflow-detail-route.server";
import type { LynxWorkflowSessionDetailPageProps } from "../../_route-props";

export const metadata: Metadata = {
  title: "Lynx workflow",
};

export default async function LynxWorkflowSessionDetailPage({
  params,
}: LynxWorkflowSessionDetailPageProps) {
  return LynxWorkflowDetailRoute({ params });
}
