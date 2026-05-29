import {
  LynxWorkflowSessionHeroSection,
  LynxWorkflowSessionResumeSection,
  LynxWorkflowSessionRunsSection,
} from "@/workspace-routes/lynx-workflow-session-detail-route.sections.server";
import {
  GovernedListSectionSkeleton,
  GovernedStatSectionSkeleton,
  ModuleScreenHeaderSkeleton,
} from "@/workspace-routes/workspace-section-skeletons";
import { Suspense } from "react";

type LynxWorkflowSessionDetailRoutePageProps = {
  params: Promise<{ workflowSessionId: string }>;
};

export function LynxWorkflowSessionDetailRoutePage({
  params,
}: LynxWorkflowSessionDetailRoutePageProps) {
  return (
    <div className="flex flex-col gap-surface-2xl">
      <Suspense fallback={<ModuleScreenHeaderSkeleton />}>
        {params.then(({ workflowSessionId }) => (
          <LynxWorkflowSessionHeroSection
            workflowSessionId={workflowSessionId}
          />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedStatSectionSkeleton statCount={1} />}>
        {params.then(({ workflowSessionId }) => (
          <LynxWorkflowSessionResumeSection
            workflowSessionId={workflowSessionId}
          />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={6} tall />}>
        {params.then(({ workflowSessionId }) => (
          <LynxWorkflowSessionRunsSection
            workflowSessionId={workflowSessionId}
          />
        ))}
      </Suspense>
    </div>
  );
}
