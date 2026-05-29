import { RecordDetailSection } from "@/workspace-routes/record-detail-route.sections.server";
import { WorkspaceEntityDetailSkeleton } from "@/workspace-routes/workspace-section-skeletons";
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
