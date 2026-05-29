import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrOnboardingUiCopy } from "@afenda/feature-hr/metadata";
import {
  buildHrOnboardingPageModel,
  HrOnboardingAccessDenied,
  HrOnboardingSection,
  loadHrOnboardingFormOptions,
  requireHrOnboardingRead,
} from "@afenda/feature-hr/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding — HR",
  description: "Employee onboarding cases for the active tenant.",
};

export default async function HrOnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrOnboardingUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrOnboardingRead();
    const { window, searchValue, checklistItems } = await buildHrOnboardingPageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
      limit: 25,
    });

    const formOptions = canWrite
      ? await loadHrOnboardingFormOptions(organization.id)
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
        <HrOnboardingSection
          window={window}
          searchValue={searchValue}
          canWrite={canWrite}
          employees={formOptions?.employees ?? []}
          checklistItems={checklistItems}
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
        <HrOnboardingAccessDenied />
      </div>
    );
  }
}
