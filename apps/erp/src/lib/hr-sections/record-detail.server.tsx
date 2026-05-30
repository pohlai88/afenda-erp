import {
  buildHrEmployeeRecordDetailPageModel,
  HrRecordsDetailNotFoundPanel,
  HrRecordsDetailSection,
  requireHrRecordsRead,
  toHrEmployeeRecordDetailPageModelInput,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import { notFound } from "next/navigation";

import { HR_MODULE_ID } from "@/lib/hr-route.shared";

function isRecordsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function HrEmployeeRecordDetailPage({
  recordId,
}: {
  recordId: string;
}) {
  let guard: Awaited<ReturnType<typeof requireHrRecordsRead>>;

  try {
    guard = await requireHrRecordsRead();
  } catch (error) {
    if (isRecordsAccessFailure(error)) {
      return <HrRecordsDetailNotFoundPanel />;
    }
    throw error;
  }

  const model = await buildHrEmployeeRecordDetailPageModel(
    toHrEmployeeRecordDetailPageModelInput({
      organizationId: guard.organization.id,
      employeeId: recordId,
      canViewSensitive: guard.canViewSensitive,
    }),
  );

  if (!model) {
    notFound();
  }

  return <HrRecordsDetailSection model={model} />;
}

export function isHrEmployeeRecordDetailRoute(moduleId: string) {
  return moduleId === HR_MODULE_ID;
}
