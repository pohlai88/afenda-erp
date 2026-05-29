import { loadModuleRecordDetailContext } from "@/workspace-routes/workspace-route-cache";
import { RecordDetailRoutePage } from "@/workspace-routes/record-detail-route";
import type { Metadata } from "next";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type RecordDetailPageProps = {
  params: Promise<{
    moduleId: string;
    recordId: string;
  }>;
};

export async function generateMetadata(
  props: RecordDetailPageProps,
): Promise<Metadata> {
  const { moduleId, recordId } = await props.params;
  const { moduleDefinition, record } = await loadModuleRecordDetailContext(
    moduleId,
    recordId,
  );

  return {
    title: `${record.reference} | ${moduleDefinition.label}`,
    description: record.title,
  };
}

export default function RecordDetailPage(props: RecordDetailPageProps) {
  return <RecordDetailRoutePage params={props.params} />;
}
