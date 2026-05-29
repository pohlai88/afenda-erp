import { LynxWorkflowsRoutePage } from "@/workspace-routes/lynx-workflows-route";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type LynxWorkflowsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function LynxWorkflowsPage({ searchParams }: LynxWorkflowsPageProps) {
  return <LynxWorkflowsRoutePage searchParams={searchParams} />;
}
