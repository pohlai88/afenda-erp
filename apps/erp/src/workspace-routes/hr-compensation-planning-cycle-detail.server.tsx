import {
  hrCpmUiCopy,
  toHrCpmCycleDetailPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCpmCycleDetailPageModel,
  HrCpmAccessDeniedPanel,
  HrCpmCycleDetailSection,
  requireHrCpmRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: `Cycle — ${hrCpmUiCopy.page.title}`,
  description: hrCpmUiCopy.page.description,
};

export default async function HrCompensationPlanningCycleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ cycleId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { cycleId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrCpmRead>>;

  try {
    guard = await requireHrCpmRead();
  } catch {
    return <HrCpmAccessDeniedPanel />;
  }

  const pageModel = await buildHrCpmCycleDetailPageModel(
    toHrCpmCycleDetailPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.cpm.write"),
      cycleId,
      searchParams: resolvedSearchParams,
    }),
  );

  if (!pageModel) {
    notFound();
  }

  return <HrCpmCycleDetailSection pageModel={pageModel} />;
}
