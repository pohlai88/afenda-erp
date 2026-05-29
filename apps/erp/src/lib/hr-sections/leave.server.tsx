import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrLeaveUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrLeavePageModel,
  HrLeaveAccessDenied,
  HrLeaveSection,
  loadHrLifecycleFormOptions,
  requireHrLeaveRead,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave — HR",
  description: "Employee leave requests for the active tenant.",
};

export default async function HrLeavePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrLeaveUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrLeaveRead();
    const { window, pendingWindow, searchValue } = await buildHrLeavePageModel({
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
        <HrLeaveSection
          window={window}
          pendingWindow={pendingWindow}
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
        <HrLeaveAccessDenied />
      </div>
    );
  }
}
