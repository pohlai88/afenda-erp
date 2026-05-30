import { hrBenefitsUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrBenefitsPageModel,
  HrBenefitsAccessDeniedPanel,
  HrBenefitsWorkbenchSection,
  requireHrBenefitsRead,
  toHrBenefitsPageModelInput,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrBenefitsUiCopy.page.title} — HR`,
  description: hrBenefitsUiCopy.page.description,
};

export default async function HrBenefitsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrBenefitsRead>>;

  try {
    guard = await requireHrBenefitsRead();
  } catch {
    return <HrBenefitsAccessDeniedPanel />;
  }

  const pageModel = await buildHrBenefitsPageModel(
    toHrBenefitsPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.benefits.write"),
      canViewSensitive: guard.canViewSensitive,
      searchParams: resolvedSearchParams,
    }),
  );

  return (
    <HrBenefitsWorkbenchSection
      pageModel={pageModel}
      canWrite={guard.hasCapability("hr.benefits.write")}
    />
  );
}
