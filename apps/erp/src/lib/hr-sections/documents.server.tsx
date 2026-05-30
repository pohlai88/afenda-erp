import {
  hrDocumentsUiCopy,
  toHrDocumentsPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrDocumentsPageModel,
  HrDocumentsAccessDeniedPanel,
  HrDocumentsWorkbenchSection,
  requireHrDocumentsRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrDocumentsUiCopy.page.title} — HR`,
  description: hrDocumentsUiCopy.page.description,
};

function isDocumentsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrDocumentsPage({
  searchParams,
}: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrDocumentsRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrDocumentsRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isDocumentsAccessFailure(error)) {
      return <HrDocumentsAccessDeniedPanel />;
    }
    throw error;
  }

  const model = await buildHrDocumentsPageModel(
    toHrDocumentsPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.documents.write"),
      canViewSensitive: guard.canViewSensitive,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrDocumentsWorkbenchSection model={model} />;
}
