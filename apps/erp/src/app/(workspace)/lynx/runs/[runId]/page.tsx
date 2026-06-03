import { LynxRunDetailRoutePage } from "@/routes/workspace/lynx/lynx-run-detail-route";

export const unstable_instant = false;

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default function LynxRunDetailPage({ params }: PageProps) {
  return <LynxRunDetailRoutePage params={params} />;
}
