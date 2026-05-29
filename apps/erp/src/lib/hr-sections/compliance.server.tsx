import { hrComplianceUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCompliancePageModel,
  HrComplianceAccessDeniedPanel,
  HrComplianceWorkbenchSection,
  loadComplianceFormOptions,
  parseHrComplianceSearchParams,
  requireHrComplianceRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrComplianceUiCopy.page.title} — HR`,
  description: hrComplianceUiCopy.page.description,
};

export default async function HrCompliancePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { obligationSearch, exceptionSearch, laborLawSearch, workEligibilitySearch } =
    parseHrComplianceSearchParams(resolvedSearchParams);

  let guard: Awaited<ReturnType<typeof requireHrComplianceRead>>;

  try {
    guard = await requireHrComplianceRead();
  } catch {
    return <HrComplianceAccessDeniedPanel />;
  }

  const { organization } = guard;
  const canWrite = guard.hasCapability("hr.compliance.write");

  const [model, formOptions] = await Promise.all([
    buildHrCompliancePageModel({
      organizationId: organization.id,
      canWrite,
      obligationSearch,
      exceptionSearch,
      laborLawSearch,
      workEligibilitySearch,
    }),
    loadComplianceFormOptions(organization.id),
  ]);

  return (
    <HrComplianceWorkbenchSection
      model={model}
      departments={formOptions.departments}
    />
  );
}
