import { renderHrEmployeeRecordDetailPage } from "@afenda/feature-hr-suite/server";
import { notFound } from "next/navigation";

import { HR_MODULE_ID } from "@/lib/hr-route.shared";

export async function HrEmployeeRecordDetailPage({
  recordId,
}: {
  recordId: string;
}) {
  const section = await renderHrEmployeeRecordDetailPage(recordId);
  if (!section) {
    notFound();
  }
  return section;
}

export function isHrEmployeeRecordDetailRoute(moduleId: string) {
  return moduleId === HR_MODULE_ID;
}
