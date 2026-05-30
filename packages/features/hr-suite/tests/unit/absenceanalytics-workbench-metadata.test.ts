import { describe, expect, it } from "vitest";

import {
  getHrAatListSurfaceKeys,
  HR_AAT_LIST_SURFACE_KEYS,
  HR_AAT_LIST_SEARCH_PARAMS_BY_KEY,
  HR_AAT_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_AAT_LIST_SURFACE_COLUMNS_BY_KEY,
  hrAatAuditTrailSearchParam,
  hrAatNotificationsSearchParam,
  hrAatRiskIndicatorsSearchParam,
  hrAatSnapshotsSearchParam,
} from "../../src/time-attendance/absence-analytics-trends/metadata";

describe("hr aat workbench metadata", () => {
  it("exports stable list surface keys", () => {
    expect(getHrAatListSurfaceKeys()).toEqual(HR_AAT_LIST_SURFACE_KEYS);
    expect(HR_AAT_LIST_SURFACE_KEYS.length).toBe(4);
  });

  it("registers column namespaces for every list surface key", () => {
    for (const surfaceKey of HR_AAT_LIST_SURFACE_KEYS) {
      expect(HR_AAT_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey]).toBeTruthy();
    }
  });

  it("maps every searchable surface param to a page-model field", () => {
    for (const [surfaceKey, paramKey] of Object.entries(
      HR_AAT_LIST_SEARCH_PARAMS_BY_KEY,
    )) {
      expect(HR_AAT_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
      expect(surfaceKey).toMatch(/^hr\.time\.aat\./);
    }
  });

  it("maps searchable AAT surfaces to URL params", () => {
    expect(HR_AAT_LIST_SEARCH_PARAMS_BY_KEY).toMatchObject({
      "hr.time.aat.risk-indicators.list": hrAatRiskIndicatorsSearchParam,
      "hr.time.aat.snapshots.list": hrAatSnapshotsSearchParam,
      "hr.time.aat.notifications.list": hrAatNotificationsSearchParam,
      "hr.time.aat.audit-trail.list": hrAatAuditTrailSearchParam,
    });
    for (const param of Object.values(HR_AAT_LIST_SEARCH_PARAMS_BY_KEY)) {
      expect(param).toMatch(/^aat/);
    }
  });
});
