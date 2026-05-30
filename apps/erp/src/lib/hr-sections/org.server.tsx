import {
  hrOrgUiCopy,
  toHrOrgPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrOrgPageModel,
  HrOrgAccessDeniedPanel,
  HrOrgWorkbenchSection,
  requireHrOrgRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrOrgUiCopy.page.title} — HR`,
  description: hrOrgUiCopy.page.description,
};

function isOrgAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrOrgPage({ searchParams }: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrOrgRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrOrgRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isOrgAccessFailure(error)) {
      return <HrOrgAccessDeniedPanel />;
    }
    throw error;
  }

  const model = await buildHrOrgPageModel(
    toHrOrgPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.org.write"),
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrOrgWorkbenchSection model={model} />;
}
