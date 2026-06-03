import type { Metadata } from "next";
import { LynxWorkflowsRoute } from "@/routes/lynx-workflows-route.server";
import type { LynxSearchPageProps } from "@/routes/lynx-route-props";

export const metadata: Metadata = {
  title: "Lynx workflows",
};

export default async function LynxWorkflowsPage({
  searchParams,
}: LynxSearchPageProps) {
  return LynxWorkflowsRoute({ searchParams });
}
