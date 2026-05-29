import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrShiftsUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrShiftsPageModel,
  HrShiftsAccessDenied,
  HrShiftsSection,
  loadHrLifecycleFormOptions,
  requireHrShiftsRead,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shifts — HR",
  description: "Shift templates and assignments for the active tenant.",
};

export default async function HrShiftsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrShiftsUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrShiftsRead();
    const {
      assignmentWindow,
      scheduledWindow,
      cancellableWindow,
      templateWindow,
      searchValue,
    } = await buildHrShiftsPageModel({
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
        <HrShiftsSection
          assignmentWindow={assignmentWindow}
          scheduledWindow={scheduledWindow}
          cancellableWindow={cancellableWindow}
          templateWindow={templateWindow}
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
        <HrShiftsAccessDenied />
      </div>
    );
  }
}
