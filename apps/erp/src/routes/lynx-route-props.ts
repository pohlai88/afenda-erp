import type { LynxRouteSearchParams } from "@afenda/feature-lynx/server";

export type LynxSearchPageProps = {
  searchParams: Promise<LynxRouteSearchParams>;
};

export type LynxRunDetailPageProps = {
  params: Promise<{ runId: string }>;
};

export type LynxWorkflowSessionDetailPageProps = {
  params: Promise<{ sessionId: string }>;
};
