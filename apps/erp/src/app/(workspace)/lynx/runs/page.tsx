import { LynxRunsRoutePage } from "@/routes/workspace/lynx/lynx-runs-route";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type LynxRunsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function LynxRunsPage({ searchParams }: LynxRunsPageProps) {
  return <LynxRunsRoutePage searchParams={searchParams} />;
}
