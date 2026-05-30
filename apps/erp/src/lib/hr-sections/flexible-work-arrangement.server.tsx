import {
  hrFwaUiCopy,
  toHrFwaPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrFwaPageModel,
  HrFwaAccessDeniedPanel,
  HrFwaWorkbenchSection,
  requireHrFwaRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrFwaUiCopy.page.title} — HR`,
  description: hrFwaUiCopy.page.description,
};

export default async function HrFlexibleWorkArrangementPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrFwaRead>>;

  try {
    guard = await requireHrFwaRead();
  } catch {
    return <HrFwaAccessDeniedPanel />;
  }

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteFwa ? "org" : "team",
  });

  const pageModel = await buildHrFwaPageModel(
    toHrFwaPageModelInput({
      organizationId: guard.organization.id,
      canReadCompliance: guard.canReadCompliance,
      canReadAudit: guard.canReadAudit,
      visibleEmployeeIds,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrFwaWorkbenchSection model={pageModel} />;
}
