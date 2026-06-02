import {
  hrCpmUiCopy,
  toHrCpmReportsPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCpmReportsPageModel,
  HrCpmAccessDeniedPanel,
  HrCpmReportsSection,
  requireHrCpmRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrCpmUiCopy.reports.pageTitle} — HR`,
  description: hrCpmUiCopy.reports.pageDescription,
};

export default async function HrCompensationPlanningReportsPage({
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

  const pageModel = await buildHrCpmReportsPageModel(
    toHrCpmReportsPageModelInput({
      organizationId: guard.organization.id,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrCpmReportsSection pageModel={pageModel} />;
}
