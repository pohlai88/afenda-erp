import { hrAatUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrAatPageModel,
  HrAatAccessDeniedPanel,
  HrAatWorkbenchSection,
  requireHrAatRead,
  toHrAatPageModelInput,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrAatUiCopy.page.title} — HR`,
  description: hrAatUiCopy.page.description,
};

export default async function HrAbsenceAnalyticsTrendsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrAatRead>>;

  try {
    guard = await requireHrAatRead();
  } catch {
    return <HrAatAccessDeniedPanel />;
  }

  const pageModel = await buildHrAatPageModel(
    toHrAatPageModelInput({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      canViewRiskIndicators: guard.canViewRiskIndicators,
      canViewAudit:
        guard.accessRole === "auditor" ||
        guard.accessRole === "hr" ||
        guard.accessRole === "compliance",
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrAatWorkbenchSection model={pageModel} />;
}
