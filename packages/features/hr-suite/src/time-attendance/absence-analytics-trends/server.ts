import React from "react";

import {
  buildHrAatPageModel,
} from "./data/hr.time.aat.page-model.server";
import { toHrAatPageModelInput } from "./data/hr.time.aat-search-params.parse.shared";
import { requireHrAatReportRead } from "./policies/hr.time.aat-access.policy.server";

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export * from "./data/hr.time.aat.page-model.server";
export * from "./data/hr.time.aat-audit.server";
export * from "./data/hr.time.aat-snapshots.server";
export * from "./data/hr.time.aat-notifications.server";
export * from "./data/hr.time.aat-search-params.parse.shared";

export {
  HrAatAccessDeniedPanel,
  HrAatWorkbenchSection,
} from "./components/hr.time.aat-section.component.server";

export {
  requireHrAatReportRead as requireHrAatRead,
  requireHrAatRiskRead,
} from "./policies/hr.time.aat-access.policy.server";

export {
  buildHrAatRiskIndicatorsListSurface,
  hrAatRiskIndicatorsSurfaceKey,
} from "./surface/hr.time.aat-risk-indicators-list.surface";
export {
  buildHrAatSnapshotsListSurface,
  hrAatSnapshotsSurfaceKey,
} from "./surface/hr.time.aat-snapshots-list.surface";
export {
  buildHrAatNotificationsListSurface,
  hrAatNotificationsSurfaceKey,
} from "./surface/hr.time.aat-notifications-list.surface";
export {
  buildHrAatAuditTrailListSurface,
  hrAatAuditTrailSurfaceKey,
} from "./surface/hr.time.aat-audit-trail-list.surface";

import { HrAatAccessDeniedPanel } from "./components/hr.time.aat-section.component.server";
import { HrAatWorkbenchSection } from "./components/hr.time.aat-section.component.server";

export function HrAatAccessDenied() {
  return React.createElement(HrAatAccessDeniedPanel);
}

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export async function renderHrAatPage(searchParams?: HrSearchParamsInput) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const guard = await requireHrAatReportRead();
    const model = await buildHrAatPageModel(
      toHrAatPageModelInput({
        organizationId: guard.organization.id,
        actorAuthUserId: guard.session.id,
        canViewRiskIndicators: guard.canViewRiskIndicators,
        canViewAudit:
          guard.accessRole === "auditor" ||
          guard.accessRole === "hr" ||
          guard.accessRole === "compliance",
        searchParams: resolvedSearchParams,
      }),
    );

    return React.createElement(HrAatWorkbenchSection, { model });
  } catch {
    return React.createElement(HrAatAccessDeniedPanel);
  }
}
