import { hrAttendanceUiCopy, toHrLamPageModelInput } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrLamPageModel,
  HrAttendanceAccessDeniedPanel,
  HrAttendanceWorkbenchSection,
  requireHrAttendanceRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrAttendanceUiCopy.page.title} — HR`,
  description: hrAttendanceUiCopy.page.description,
};

export default async function HrAttendancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrAttendanceRead>>;

  try {
    guard = await requireHrAttendanceRead();
  } catch {
    return <HrAttendanceAccessDeniedPanel />;
  }

  const pageModel = await buildHrLamPageModel(
    toHrLamPageModelInput({
      organizationId: guard.organization.id,
      canWriteLeave: false,
      canWriteAttendance: guard.canWriteAttendance,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrAttendanceWorkbenchSection model={pageModel} />;
}
