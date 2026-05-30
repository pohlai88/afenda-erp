import { hrLamUiCopy, toHrLamPageModelInput } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrLamPageModel,
  HrLamAccessDeniedPanel,
  HrLamWorkbenchSection,
  requireHrLamRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrLamUiCopy.page.title} — HR`,
  description: hrLamUiCopy.page.description,
};

export default async function HrLeaveAttendancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrLamRead>>;

  try {
    guard = await requireHrLamRead();
  } catch {
    return <HrLamAccessDeniedPanel />;
  }

  const pageModel = await buildHrLamPageModel(
    toHrLamPageModelInput({
      organizationId: guard.organization.id,
      canWriteLeave: guard.canWriteLeave,
      canWriteAttendance: guard.canWriteAttendance,
      canReadPayrollRefs: guard.canReadPayrollRefs,
      canReadAudit: guard.canReadAudit,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrLamWorkbenchSection model={pageModel} />;
}
