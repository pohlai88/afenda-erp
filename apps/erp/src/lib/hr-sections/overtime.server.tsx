import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrOvertimeUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrOvertimePageModel,
  HrOvertimeAccessDenied,
  HrOvertimeSection,
  loadHrLifecycleFormOptions,
  requireHrOvertimeRead,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overtime — HR",
  description: "Employee overtime requests for the active tenant.",
};

export default async function HrOvertimePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrOvertimeUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrOvertimeRead();
    const { window, pendingWindow, searchValue } = await buildHrOvertimePageModel({
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
        <HrOvertimeSection
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
        <HrOvertimeAccessDenied />
      </div>
    );
  }
}
