import { LynxWorkflowsRoutePage } from "@/routes/workspace/lynx/lynx-workflows-route";

export const unstable_instant = false;

type LynxWorkflowsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function LynxWorkflowsPage({ searchParams }: LynxWorkflowsPageProps) {
  return <LynxWorkflowsRoutePage searchParams={searchParams} />;
}
