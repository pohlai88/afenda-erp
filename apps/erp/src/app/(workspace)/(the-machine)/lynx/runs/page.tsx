import type { Metadata } from "next";
import { LynxRunsRoute } from "@/workspace-routes/lynx/lynx-runs-route.server";
import type { LynxSearchPageProps } from "../_route-props";

export const metadata: Metadata = {
  title: "Lynx runs",
};

export default async function LynxRunsPage({
  searchParams,
}: LynxSearchPageProps) {
  return LynxRunsRoute({ searchParams });
}
