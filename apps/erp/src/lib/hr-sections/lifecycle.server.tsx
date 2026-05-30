import {
  hrLifecycleUiCopy,
  toHrLifecyclePageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrLifecyclePageModel,
  HrLifecycleAccessDeniedPanel,
  HrLifecycleWorkbenchSection,
  requireHrLifecycleRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrLifecycleUiCopy.page.title} — HR`,
  description: hrLifecycleUiCopy.page.description,
};

function isLifecycleAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrLifecyclePage({
  searchParams,
}: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrLifecycleRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrLifecycleRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isLifecycleAccessFailure(error)) {
      return <HrLifecycleAccessDeniedPanel />;
    }
    throw error;
  }

  const model = await buildHrLifecyclePageModel(
    toHrLifecyclePageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.lifecycle.write"),
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrLifecycleWorkbenchSection model={model} />;
}
