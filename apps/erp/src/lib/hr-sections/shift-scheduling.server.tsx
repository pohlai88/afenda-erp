import { hrSftUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrSftPageModel,
  buildHrSftSelfServicePageModel,
  HrSftAccessDeniedPanel,
  HrSftMySwapsSection,
  HrSftWorkbenchSection,
  requireHrSftRead,
  toHrSftPageModelInput,
  toHrSftSelfServicePageModelInput,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrSftUiCopy.page.title} — HR`,
  description: hrSftUiCopy.page.description,
};

export default async function HrShiftSchedulingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrSftRead>>;

  try {
    guard = await requireHrSftRead();
  } catch {
    return <HrSftAccessDeniedPanel />;
  }

  const actorEmployeeId = guard.actorEmployeeIds[0];

  if (guard.accessScope === "self" && actorEmployeeId) {
    const selfServiceModel = await buildHrSftSelfServicePageModel(
      toHrSftSelfServicePageModelInput({
        organizationId: guard.organization.id,
        actorEmployeeId,
        searchParams: resolvedSearchParams,
      }),
    );

    return <HrSftMySwapsSection model={selfServiceModel} />;
  }

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds();

  const pageModel = await buildHrSftPageModel(
    toHrSftPageModelInput({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      accessScope: guard.accessScope,
      canManage: guard.canManageShifts,
      canApprove: guard.canApprove,
      actorEmployeeId,
      canViewPayrollRefs: guard.canViewPayrollRefs,
      canViewAudit: guard.canViewAudit,
      visibleEmployeeIds,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrSftWorkbenchSection model={pageModel} />;
}
