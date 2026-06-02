import {
  hrSbsUiCopy,
  parseHrSbsSearchParams,
  toHrSbsAuditPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrSbsAuditPageModel,
  HrSbsAccessDeniedPanel,
  HrSbsAuditSection,
  requireHrSbsRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Audit — ${hrSbsUiCopy.page.title}`,
  description: hrSbsUiCopy.page.description,
};

export default async function HrSalaryBenchmarkingAuditPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrSbsRead>>;

  try {
    guard = await requireHrSbsRead();
  } catch {
    return <HrSbsAccessDeniedPanel />;
  }

  const pageModel = await buildHrSbsAuditPageModel(
    toHrSbsAuditPageModelInput({
      organizationId: guard.organization.id,
      searchParams: parseHrSbsSearchParams(resolvedSearchParams),
    }),
  );

  return <HrSbsAuditSection pageModel={pageModel} />;
}
