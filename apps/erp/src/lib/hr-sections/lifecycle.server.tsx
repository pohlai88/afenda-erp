import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrLifecycleUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrLifecyclePageModel,
  HrLifecycleAccessDenied,
  HrLifecycleSection,
  loadHrLifecycleFormOptions,
  requireHrLifecycleRead,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lifecycle — HR",
  description: "Employment lifecycle overview for the active tenant.",
};

export default async function HrLifecyclePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrLifecycleUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrLifecycleRead();
    const { window, searchValue } = await buildHrLifecyclePageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
      limit: 25,
    });

    const formOptions = canWrite
      ? await loadHrLifecycleFormOptions(organization.id)
      : undefined;
    const employees = formOptions?.employees ?? [];

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
        <HrLifecycleSection
          window={window}
          searchValue={searchValue}
          canWrite={canWrite}
          employees={employees}
          formOptions={formOptions}
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
        <HrLifecycleAccessDenied />
      </div>
    );
  }
}
