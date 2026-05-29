import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrOffboardingUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrOffboardingPageModel,
  HrOffboardingAccessDenied,
  HrOffboardingSection,
  loadHrLifecycleFormOptions,
  requireHrOffboardingRead,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offboarding — HR",
  description: "Employee offboarding cases for the active tenant.",
};

export default async function HrOffboardingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrOffboardingUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrOffboardingRead();
    const { window, searchValue, clearanceItems } = await buildHrOffboardingPageModel({
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
        <HrOffboardingSection
          window={window}
          searchValue={searchValue}
          canWrite={canWrite}
          employees={formOptions?.employees ?? []}
          clearanceItems={clearanceItems}
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
        <HrOffboardingAccessDenied />
      </div>
    );
  }
}
