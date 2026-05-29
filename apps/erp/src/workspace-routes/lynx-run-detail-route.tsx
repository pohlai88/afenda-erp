import {
  LynxRunDetailClaimsSection,
  LynxRunDetailFeedbackSection,
  LynxRunDetailHeroSection,
  LynxRunDetailTimelineSection,
} from "@/workspace-routes/lynx-run-detail-route.sections.server";
import {
  GovernedListSectionSkeleton,
  GovernedStatSectionSkeleton,
  ModuleScreenHeaderSkeleton,
} from "@/workspace-routes/workspace-section-skeletons";
import { Suspense } from "react";

type LynxRunDetailRoutePageProps = {
  params: Promise<{ runId: string }>;
};

export function LynxRunDetailRoutePage({ params }: LynxRunDetailRoutePageProps) {
  return (
    <div className="flex flex-col gap-surface-2xl">
      <Suspense fallback={<ModuleScreenHeaderSkeleton />}>
        {params.then(({ runId }) => (
          <LynxRunDetailHeroSection runId={runId} />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={6} tall />}>
        {params.then(({ runId }) => (
          <LynxRunDetailTimelineSection runId={runId} />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={4} />}>
        {params.then(({ runId }) => (
          <LynxRunDetailClaimsSection runId={runId} />
        ))}
      </Suspense>

      <Suspense
        fallback={
          <div className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
            <GovernedListSectionSkeleton rows={4} />
            <GovernedStatSectionSkeleton statCount={1} />
          </div>
        }
      >
        {params.then(({ runId }) => (
          <LynxRunDetailFeedbackSection runId={runId} />
        ))}
      </Suspense>
    </div>
  );
}
