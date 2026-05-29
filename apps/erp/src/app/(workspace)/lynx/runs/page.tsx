import { LynxRunsRoutePage } from "@/workspace-routes/lynx-runs-route";
import type { WorkspaceRouteInstant } from "@/workspace-routes/workspace-route-instant";

export const unstable_instant = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;

type LynxRunsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function LynxRunsPage({ searchParams }: LynxRunsPageProps) {
  return <LynxRunsRoutePage searchParams={searchParams} />;
}
