import {
  hrGeoUiCopy,
  toHrGeoPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrGeoPageModel,
  HrGeoAccessDeniedPanel,
  HrGeoWorkbenchSection,
  requireHrGeoRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrGeoUiCopy.page.title} — HR`,
  description: hrGeoUiCopy.page.description,
};

function isGeoAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrGeolocationRemoteCheckinPage({
  searchParams,
}: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrGeoRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrGeoRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isGeoAccessFailure(error)) {
      return <HrGeoAccessDeniedPanel />;
    }
    throw error;
  }

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteGeo ? "org" : "team",
  });

  const pageModel = await buildHrGeoPageModel(
    toHrGeoPageModelInput({
      organizationId: guard.organization.id,
      canWriteGeo: guard.canWriteGeo,
      canViewDetailedLocation: guard.canViewDetailedLocation,
      canReadAudit: guard.canReadAudit,
      visibleEmployeeIds,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrGeoWorkbenchSection model={pageModel} />;
}
