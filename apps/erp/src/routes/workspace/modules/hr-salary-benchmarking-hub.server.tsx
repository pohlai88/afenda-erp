import {
  hrSbsUiCopy,
  parseHrSbsSearchParams,
  toHrSbsHubPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrSbsHubPageModel,
  HrSbsAccessDeniedPanel,
  HrSbsHubSection,
  requireHrSbsRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrSbsUiCopy.page.title} — HR`,
  description: hrSbsUiCopy.page.description,
};

export default async function HrSalaryBenchmarkingHubPage({
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

  const pageModel = await buildHrSbsHubPageModel(
    toHrSbsHubPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.sbs.write"),
      searchParams: parseHrSbsSearchParams(resolvedSearchParams),
    }),
  );

  return <HrSbsHubSection pageModel={pageModel} />;
}
