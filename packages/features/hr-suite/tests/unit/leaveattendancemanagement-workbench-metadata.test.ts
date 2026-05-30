import { describe, expect, it } from "vitest";

import {
  getHrLamListSurfaceKeys,
  HR_LAM_LIST_SURFACE_KEYS,
  HR_LAM_LIST_SEARCH_PARAMS_BY_KEY,
  HR_LAM_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_LAM_LIST_SURFACE_COLUMNS_BY_KEY,
  hrLamAttendanceDaysSearchParam,
  hrLamLeaveBalancesSearchParam,
  hrLamLeaveRequestsSearchParam,
} from "../../src/time-attendance/leave-attendance-management/metadata";

describe("hr lam workbench metadata", () => {
  it("exports stable list surface keys", () => {
    expect(getHrLamListSurfaceKeys()).toEqual(HR_LAM_LIST_SURFACE_KEYS);
    expect(HR_LAM_LIST_SURFACE_KEYS.length).toBeGreaterThanOrEqual(3);
  });

  it("registers column namespaces for every list surface key", () => {
    for (const surfaceKey of HR_LAM_LIST_SURFACE_KEYS) {
      expect(HR_LAM_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey]).toBeTruthy();
    }
  });

  it("maps every searchable surface param to a page-model field", () => {
    for (const [surfaceKey, paramKey] of Object.entries(
      HR_LAM_LIST_SEARCH_PARAMS_BY_KEY,
    )) {
      expect(HR_LAM_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
      expect(surfaceKey).toMatch(/^hr\.time\.lam\./);
    }
  });

  it("maps searchable LAM surfaces to URL params", () => {
    expect(HR_LAM_LIST_SEARCH_PARAMS_BY_KEY).toMatchObject({
      "hr.time.lam.attendance_days.list": hrLamAttendanceDaysSearchParam,
      "hr.time.lam.leave_requests.list": hrLamLeaveRequestsSearchParam,
      "hr.time.lam.leave_balances.list": hrLamLeaveBalancesSearchParam,
    });
    for (const param of Object.values(HR_LAM_LIST_SEARCH_PARAMS_BY_KEY)) {
      expect(param).toMatch(/^lam/);
    }
  });
});
