
import {
  getHrFwaArrangementById,
  getHrFwaSchedulePattern,
} from "@afenda/db";

import {
  eachUtcDayInRange,
  hrFwaRemoteCheckinCompareResultSchema,
  normalizeHrFwaSchedulePattern,
  resolveHrFwaDayExpectation,
  startOfUtcDay,
  type HrFwaRemoteCheckinCompareResult,
  type HrFwaRemoteCheckinCompareRow,
} from "../schemas/hr.time.fwa-compliance.schema";

export type HrGeoVerifiedRemoteCheckinDay = {
  workDate: Date;
  checkinCount: number;
  verified: boolean;
  locationApproved: boolean;
};

type GeoRemoteCheckinBoundary = {
  listVerifiedRemoteCheckinDaysForEmployee?: (input: {
    organizationId: string;
    employeeId: string;
    workDateFrom: Date;
    workDateTo: Date;
  }) => Promise<readonly HrGeoVerifiedRemoteCheckinDay[]>;
};

async function loadGeoRemoteCheckinDays(input: {
  organizationId: string;
  employeeId: string;
  workDateFrom: Date;
  workDateTo: Date;
}): Promise<{
  integrationEnabled: boolean;
  rows: readonly HrGeoVerifiedRemoteCheckinDay[];
}> {
  try {
    const importGeoBoundary = new Function(
      "return import('../../geolocation-remote-checkin/data/hr.time.geo-lam-integration.server')",
    ) as () => Promise<GeoRemoteCheckinBoundary>;
    const geoModule = await importGeoBoundary();

    if (
      typeof geoModule.listVerifiedRemoteCheckinDaysForEmployee !== "function"
    ) {
      return { integrationEnabled: false, rows: [] };
    }

    const rows = await geoModule.listVerifiedRemoteCheckinDaysForEmployee(input);
    return { integrationEnabled: true, rows };
  } catch {
    return { integrationEnabled: false, rows: [] };
  }
}

function remoteCheckinByDateKey(
  rows: readonly HrGeoVerifiedRemoteCheckinDay[],
): Map<string, HrGeoVerifiedRemoteCheckinDay> {
  const map = new Map<string, HrGeoVerifiedRemoteCheckinDay>();
  for (const row of rows) {
    map.set(startOfUtcDay(row.workDate).toISOString(), row);
  }
  return map;
}

function compareRemoteDay(
  expectedRemote: boolean,
  workDate: Date,
  checkin: HrGeoVerifiedRemoteCheckinDay | undefined,
  integrationEnabled: boolean,
): HrFwaRemoteCheckinCompareRow {
  if (!expectedRemote) {
    return {
      workDate,
      expectedRemote: false,
      verifiedCheckin: false,
      checkinCount: checkin?.checkinCount ?? 0,
      aligned: true,
      mismatchReason: null,
    };
  }

  if (!integrationEnabled) {
    return {
      workDate,
      expectedRemote: true,
      verifiedCheckin: false,
      checkinCount: 0,
      aligned: true,
      mismatchReason: null,
    };
  }

  const verified =
    checkin !== undefined && checkin.verified && checkin.locationApproved;

  return {
    workDate,
    expectedRemote: true,
    verifiedCheckin: verified,
    checkinCount: checkin?.checkinCount ?? 0,
    aligned: verified,
    mismatchReason: verified
      ? null
      : checkin && !checkin.locationApproved
        ? "unapproved_remote_location"
        : "missing_remote_checkin",
  };
}

/** HRM-FWA-023 — compare approved remote schedule with geolocation check-ins. */
export async function compareHrFwaRemoteScheduleWithCheckins(input: {
  organizationId: string;
  arrangementId: string;
  periodStart: Date;
  periodEnd: Date;
  remoteCheckinEnabled?: boolean;
}): Promise<HrFwaRemoteCheckinCompareResult> {
  const arrangement = await getHrFwaArrangementById({
    organizationId: input.organizationId,
    arrangementId: input.arrangementId,
  });

  const pattern = arrangement.schedulePatternId
    ? normalizeHrFwaSchedulePattern(
        (
          await getHrFwaSchedulePattern({
            organizationId: input.organizationId,
            schedulePatternId: arrangement.schedulePatternId,
          })
        ).patternDetails,
      )
    : normalizeHrFwaSchedulePattern({});

  const geo =
    input.remoteCheckinEnabled === false
      ? { integrationEnabled: false, rows: [] as readonly HrGeoVerifiedRemoteCheckinDay[] }
      : await loadGeoRemoteCheckinDays({
          organizationId: input.organizationId,
          employeeId: arrangement.employeeId,
          workDateFrom: input.periodStart,
          workDateTo: input.periodEnd,
        });

  const byDate = remoteCheckinByDateKey(geo.rows);

  const rows = eachUtcDayInRange(input.periodStart, input.periodEnd).map(
    (workDate) => {
      const dayOfWeek = workDate.getUTCDay();
      const expectedRemote =
        resolveHrFwaDayExpectation(pattern, dayOfWeek) === "remote";
      return compareRemoteDay(
        expectedRemote,
        workDate,
        byDate.get(startOfUtcDay(workDate).toISOString()),
        geo.integrationEnabled,
      );
    },
  );

  const result = {
    requirementCode: "HRM-FWA-023" as const,
    arrangementId: input.arrangementId,
    employeeId: arrangement.employeeId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    remoteCheckinIntegrationEnabled: geo.integrationEnabled,
    rows,
    misalignedDayCount: geo.integrationEnabled
      ? rows.filter((row) => !row.aligned).length
      : 0,
  };

  return hrFwaRemoteCheckinCompareResultSchema.parse(result);
}

export function hasHrFwaUnapprovedRemoteLocation(
  compare: HrFwaRemoteCheckinCompareResult,
): boolean {
  return compare.rows.some(
    (row) => row.mismatchReason === "unapproved_remote_location",
  );
}
