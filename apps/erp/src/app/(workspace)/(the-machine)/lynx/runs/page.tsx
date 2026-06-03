import type { Metadata } from "next";
import { LynxRunsRoute } from "@/routes/lynx-runs-route.server";
import type { LynxSearchPageProps } from "@/routes/lynx-route-props";

export const metadata: Metadata = {
  title: "Lynx runs",
};

export default async function LynxRunsPage({
  searchParams,
}: LynxSearchPageProps) {
  return LynxRunsRoute({ searchParams });
}
