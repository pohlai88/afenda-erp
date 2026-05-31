import {
  hrCpmUiCopy,
  toHrCpmAuditPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCpmAuditPageModel,
  HrCpmAccessDeniedPanel,
  HrCpmAuditSection,
  requireHrCpmRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrCpmUiCopy.audit.pageTitle} — HR`,
  description: hrCpmUiCopy.audit.pageDescription,
};

export default async function HrCompensationPlanningAuditPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrCpmRead>>;

  try {
    guard = await requireHrCpmRead();
  } catch {
    return <HrCpmAccessDeniedPanel />;
  }

  const pageModel = await buildHrCpmAuditPageModel(
    toHrCpmAuditPageModelInput({
      organizationId: guard.organization.id,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrCpmAuditSection pageModel={pageModel} />;
}
