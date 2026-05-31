import { hrComplianceUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCompliancePageModel,
  HrComplianceAccessDeniedPanel,
  HrComplianceWorkbenchSection,
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
  const {
    obligationSearch,
    exceptionSearch,
    laborLawSearch,
    workEligibilitySearch,
  } = parseHrComplianceSearchParams(resolvedSearchParams);

  let guard: Awaited<ReturnType<typeof requireHrComplianceRead>>;

  try {
    guard = await requireHrComplianceRead();
  } catch {
    return <HrComplianceAccessDeniedPanel />;
  }

  const { organization } = guard;
  const canWrite = guard.hasCapability("hr.compliance.write");

  const model = await buildHrCompliancePageModel({
    organizationId: organization.id,
    canWrite,
    canViewSensitive: guard.canViewSensitive,
    obligationSearch,
    exceptionSearch,
    laborLawSearch,
    workEligibilitySearch,
  });

  return <HrComplianceWorkbenchSection model={model} />;
}
