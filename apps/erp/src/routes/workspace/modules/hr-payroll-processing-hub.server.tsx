import {
  hrPayrollUiCopy,
  toHrPayrollPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrPayrollPageModel,
  HrPayrollAccessDeniedPanel,
  HrPayrollWorkbenchSection,
  requireHrPayrollRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrPayrollUiCopy.page.title} — HR`,
  description: hrPayrollUiCopy.page.description,
};

export default async function HrPayrollProcessingHubPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrPayrollRead>>;

  try {
    guard = await requireHrPayrollRead();
  } catch {
    return <HrPayrollAccessDeniedPanel />;
  }

  const pageModel = await buildHrPayrollPageModel(
    toHrPayrollPageModelInput({
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      canWrite: guard.hasCapability("hr.payroll.write"),
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrPayrollWorkbenchSection pageModel={pageModel} />;
}
