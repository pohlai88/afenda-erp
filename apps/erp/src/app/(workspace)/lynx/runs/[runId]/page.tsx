import { LynxRunDetailRoutePage } from "@/workspace-routes/lynx-run-detail-route";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default function LynxRunDetailPage({ params }: PageProps) {
  return <LynxRunDetailRoutePage params={params} />;
}
