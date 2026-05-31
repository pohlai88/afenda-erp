import {
  hrPayrollUiCopy,
  toHrPayrollAuditPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrPayrollAuditPageModel,
  HrPayrollAccessDeniedPanel,
  HrPayrollAuditSection,
  requireHrPayrollAuditRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrPayrollUiCopy.audit.pageTitle} — HR`,
  description: hrPayrollUiCopy.audit.pageDescription,
};

export default async function HrPayrollProcessingAuditPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrPayrollAuditRead>>;

  try {
    guard = await requireHrPayrollAuditRead();
  } catch {
    return <HrPayrollAccessDeniedPanel />;
  }

  const pageModel = await buildHrPayrollAuditPageModel(
    toHrPayrollAuditPageModelInput({
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrPayrollAuditSection pageModel={pageModel} />;
}
