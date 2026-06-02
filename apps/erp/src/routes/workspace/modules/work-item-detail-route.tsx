import { WorkItemDetailSection } from "@/routes/workspace/modules/work-item-detail-route.sections.server";
import { WorkspaceEntityDetailSkeleton } from "@/routes/workspace/shared/workspace-section-skeletons";
import { Suspense } from "react";

type WorkItemDetailRoutePageProps = {
  params: Promise<{
    moduleId: string;
    workItemId: string;
  }>;
};

export function WorkItemDetailRoutePage({ params }: WorkItemDetailRoutePageProps) {
  return (
    <Suspense fallback={<WorkspaceEntityDetailSkeleton />}>
      {params.then(({ moduleId, workItemId }) => (
        <WorkItemDetailSection moduleId={moduleId} workItemId={workItemId} />
      ))}
    </Suspense>
  );
}
