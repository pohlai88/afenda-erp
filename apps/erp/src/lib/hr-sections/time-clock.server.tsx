import { hrTimeClockUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrTimeClockPageModel,
  HrTimeClockAccessDeniedPanel,
  HrTimeClockWorkbenchSection,
  requireHrTimeClockRead,
  toHrTimeClockPageModelInput,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrTimeClockUiCopy.page.title} — HR`,
  description: hrTimeClockUiCopy.page.description,
};

export default async function HrTimeClockPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrTimeClockRead>>;

  try {
    guard = await requireHrTimeClockRead();
  } catch {
    return <HrTimeClockAccessDeniedPanel />;
  }

  const model = await buildHrTimeClockPageModel(
    toHrTimeClockPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.canWrite,
      canAdmin: guard.canAdmin,
      canReadAudit: true,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrTimeClockWorkbenchSection model={model} />;
}
