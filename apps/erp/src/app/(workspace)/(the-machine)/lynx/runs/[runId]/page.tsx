import type { Metadata } from "next";
import { LynxRunDetailRoute } from "@/routes/lynx-run-detail-route.server";
import type { LynxRunDetailPageProps } from "@/routes/lynx-route-props";

export const metadata: Metadata = {
  title: "Lynx run",
};

export default async function LynxRunDetailPage({
  params,
}: LynxRunDetailPageProps) {
  return LynxRunDetailRoute({ params });
}
