import type { Metadata } from "next";
import { LynxWorkflowDetailRoute } from "@/routes/lynx-workflow-detail-route.server";
import type { LynxWorkflowSessionDetailPageProps } from "@/routes/lynx-route-props";

export const metadata: Metadata = {
  title: "Lynx workflow",
};

export default async function LynxWorkflowSessionDetailPage({
  params,
}: LynxWorkflowSessionDetailPageProps) {
  return LynxWorkflowDetailRoute({ params });
}
