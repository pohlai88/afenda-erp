import { loadModuleWorkItemDetailContext } from "@/routes/workspace/shared/workspace-route-cache";
import { WorkItemDetailRoutePage } from "@/routes/workspace/modules/work-item-detail-route";
import type { Metadata } from "next";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type WorkItemDetailPageProps = {
  params: Promise<{
    moduleId: string;
    workItemId: string;
  }>;
};

export async function generateMetadata(
  props: WorkItemDetailPageProps,
): Promise<Metadata> {
  const { moduleId, workItemId } = await props.params;
  const { moduleDefinition, workItem } = await loadModuleWorkItemDetailContext(
    moduleId,
    workItemId,
  );

  return {
    title: `${workItem.subject} | ${moduleDefinition.label}`,
    description: `${workItem.status} ${workItem.priority} work item`,
  };
}

export default function WorkItemDetailPage(props: WorkItemDetailPageProps) {
  return <WorkItemDetailRoutePage params={props.params} />;
}
