import { hrLamUiCopy, toHrLamPageModelInput } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrLamPageModel,
  HrLeaveAccessDeniedPanel,
  HrLeaveWorkbenchSection,
  requireHrLeaveRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrLamUiCopy.page.title} — Leave`,
  description: hrLamUiCopy.page.description,
};

export default async function HrLeavePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrLeaveRead>>;

  try {
    guard = await requireHrLeaveRead();
  } catch {
    return <HrLeaveAccessDeniedPanel />;
  }

  const pageModel = await buildHrLamPageModel(
    toHrLamPageModelInput({
      organizationId: guard.organization.id,
      canWriteLeave: guard.canWriteLeave,
      canWriteAttendance: false,
      canReadPayrollRefs: guard.canReadPayrollRefs,
      canReadAudit: guard.canReadAudit,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrLeaveWorkbenchSection model={pageModel} />;
}
