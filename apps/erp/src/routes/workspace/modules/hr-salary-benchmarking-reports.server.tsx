import {
  hrSbsUiCopy,
  parseHrSbsSearchParams,
  toHrSbsReportsPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrSbsReportsPageModel,
  HrSbsAccessDeniedPanel,
  HrSbsReportsSection,
  requireHrSbsRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Benchmarking reports — ${hrSbsUiCopy.page.title}`,
  description: hrSbsUiCopy.page.description,
};

export default async function HrSalaryBenchmarkingReportsPage({
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

  const pageModel = await buildHrSbsReportsPageModel(
    toHrSbsReportsPageModelInput({
      organizationId: guard.organization.id,
      searchParams: parseHrSbsSearchParams(resolvedSearchParams),
    }),
  );

  return <HrSbsReportsSection pageModel={pageModel} />;
}
