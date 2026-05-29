import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrAttendanceUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrAttendancePageModel,
  HrAttendanceAccessDenied,
  HrAttendanceSection,
  loadHrLifecycleFormOptions,
  requireHrAttendanceRead,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance — HR",
  description: "Employee attendance punches for the active tenant.",
};

export default async function HrAttendancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrAttendanceUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrAttendanceRead();
    const { window, searchValue } = await buildHrAttendancePageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
      limit: 25,
    });

    const formOptions = canWrite
      ? await loadHrLifecycleFormOptions(organization.id)
      : undefined;

    return (
      <div className="flex flex-col gap-surface-2xl">
        <SectionPanel
          headingLevel={1}
          title={pageCopy.title}
          description={pageCopy.description}
          aside={
            <Link
              className="type-caption text-muted underline-offset-2 hover:underline"
              href={hrRoutePaths.hub}
            >
              HR hub
            </Link>
          }
        />
        <HrAttendanceSection
          window={window}
          searchValue={searchValue}
          canWrite={canWrite}
          employees={formOptions?.employees ?? []}
        />
      </div>
    );
  } catch {
    return (
      <div className="flex flex-col gap-surface-lg">
        <SectionPanel
          headingLevel={1}
          title={pageCopy.title}
          description={pageCopy.description}
        />
        <HrAttendanceAccessDenied />
      </div>
    );
  }
}
