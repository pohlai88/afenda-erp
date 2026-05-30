import {
  hrRecordsUiCopy,
  toHrRecordsPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrRecordsPageModel,
  HrRecordsAccessDeniedPanel,
  HrRecordsWorkbenchSection,
  requireHrRecordsRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrRecordsUiCopy.page.title} — HR`,
  description: hrRecordsUiCopy.page.description,
};

function isRecordsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrRecordsPage({
  searchParams,
}: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrRecordsRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrRecordsRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isRecordsAccessFailure(error)) {
      return <HrRecordsAccessDeniedPanel />;
    }
    throw error;
  }

  const model = await buildHrRecordsPageModel(
    toHrRecordsPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.employees.write"),
      canViewSensitive: guard.canViewSensitive,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrRecordsWorkbenchSection model={model} />;
}
