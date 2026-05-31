import { hrBonusUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrBonusPageModel,
  HrBonusAccessDeniedPanel,
  HrBonusWorkbenchSection,
  requireHrBonusRead,
  toHrBonusPageModelInput,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrBonusUiCopy.page.title} — HR`,
  description: hrBonusUiCopy.page.description,
};

export default async function HrBonusPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrBonusRead>>;

  try {
    guard = await requireHrBonusRead();
  } catch {
    return <HrBonusAccessDeniedPanel />;
  }

  const pageModel = await buildHrBonusPageModel(
    toHrBonusPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.bonus.write"),
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrBonusWorkbenchSection pageModel={pageModel} />;
}
