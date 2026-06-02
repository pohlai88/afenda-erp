import {
  hrCpmUiCopy,
  toHrCpmHubPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCpmHubPageModel,
  HrCpmAccessDeniedPanel,
  HrCpmHubSection,
  requireHrCpmRead,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrCpmUiCopy.page.title} — HR`,
  description: hrCpmUiCopy.page.description,
};

export default async function HrCompensationPlanningHubPage({
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

  const pageModel = await buildHrCpmHubPageModel(
    toHrCpmHubPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.cpm.write"),
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrCpmHubSection pageModel={pageModel} />;
}
