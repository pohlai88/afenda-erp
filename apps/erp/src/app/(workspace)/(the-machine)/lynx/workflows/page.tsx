import type { Metadata } from "next";
import { LynxWorkflowsRoute } from "@/workspace-routes/lynx/lynx-workflows-route.server";
import type { LynxSearchPageProps } from "../_route-props";

export const metadata: Metadata = {
  title: "Lynx workflows",
};

export default async function LynxWorkflowsPage({
  searchParams,
}: LynxSearchPageProps) {
  return LynxWorkflowsRoute({ searchParams });
}
