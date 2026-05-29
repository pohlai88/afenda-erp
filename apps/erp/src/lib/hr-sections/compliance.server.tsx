import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrComplianceUiCopy } from "@afenda/feature-hr/metadata";
import {
  buildHrCompliancePageModel,
  HrComplianceAccessDenied,
  HrComplianceSection,
  loadHrLifecycleFormOptions,
  requireHrComplianceRead,
} from "@afenda/feature-hr/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance — HR",
  description: "Compliance obligations and exceptions for the active tenant.",
};

export default async function HrCompliancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrComplianceUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrComplianceRead();
    const {
      obligationsWindow,
      exceptionsWindow,
      obligationsSearch,
      exceptionsSearch,
    } = await buildHrCompliancePageModel({
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
        <HrComplianceSection
          obligationsWindow={obligationsWindow}
          exceptionsWindow={exceptionsWindow}
          obligationsSearch={obligationsSearch}
          exceptionsSearch={exceptionsSearch}
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
        <HrComplianceAccessDenied />
      </div>
    );
  }
}
