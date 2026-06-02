import { RecordDetailSection } from "@/routes/workspace/modules/record-detail-route.sections.server";
import { WorkspaceEntityDetailSkeleton } from "@/routes/workspace/shared/workspace-section-skeletons";
import { Suspense } from "react";

type RecordDetailRoutePageProps = {
  params: Promise<{
    moduleId: string;
    recordId: string;
  }>;
};

export function RecordDetailRoutePage({ params }: RecordDetailRoutePageProps) {
  return (
    <Suspense fallback={<WorkspaceEntityDetailSkeleton />}>
      {params.then(({ moduleId, recordId }) => (
        <RecordDetailSection moduleId={moduleId} recordId={recordId} />
      ))}
    </Suspense>
  );
}
