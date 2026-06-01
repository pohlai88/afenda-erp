import { hrComplianceUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCompliancePageModel,
  HrComplianceAccessDeniedPanel,
  HrComplianceWorkbenchSection,
  requireHrComplianceRead,
  toHrCompliancePageModelInput,
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
  let guard: Awaited<ReturnType<typeof requireHrComplianceRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [resolvedSearchParams, guard] = await Promise.all([
      searchParams ?? Promise.resolve(undefined),
      requireHrComplianceRead(),
    ]);
  } catch {
    return <HrComplianceAccessDeniedPanel />;
  }

  const model = await buildHrCompliancePageModel(
    toHrCompliancePageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.compliance.write"),
      canViewSensitive: guard.canViewSensitive,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrComplianceWorkbenchSection model={model} />;
}
