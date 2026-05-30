import {
  hrRecordsUiCopy,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrEmployeeRecordDetailPageModel,
  HrRecordsAccessDeniedPanel,
  HrRecordsDetailSection,
  requireHrRecordsRead,
  toHrEmployeeRecordDetailPageModelInput,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrRecordsUiCopy.detail.profileTitle} — HR`,
  description: hrRecordsUiCopy.detail.profileDescription,
};

function isRecordsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrRecordsDetailPage({
  employeeId,
}: HrSectionPageProps) {
  if (!employeeId) {
    notFound();
  }

  let guard: Awaited<ReturnType<typeof requireHrRecordsRead>>;

  try {
    guard = await requireHrRecordsRead();
  } catch (error) {
    if (isRecordsAccessFailure(error)) {
      return <HrRecordsAccessDeniedPanel />;
    }
    throw error;
  }

  const model = await buildHrEmployeeRecordDetailPageModel(
    toHrEmployeeRecordDetailPageModelInput({
      organizationId: guard.organization.id,
      employeeId,
      canViewSensitive: guard.canViewSensitive,
    }),
  );

  if (!model) {
    notFound();
  }

  return <HrRecordsDetailSection model={model} />;
}
