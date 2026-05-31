import { describe, expect, it } from "vitest";

import {
  HR_TIME_CLOCK_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_TIME_CLOCK_LIST_SURFACE_KEYS,
  HR_TIME_CLOCK_SEARCH_PARAM_TO_PAGE_MODEL_FIELD,
  getHrTimeClockListSurfaceKeys,
} from "../../src/time-attendance/time-clock-integration/surface/hr.time.clock-integration-surface-metadata.shared";

describe("timeclockintegration surface registry", () => {
  it("lists nine Pattern C surfaces", () => {
    expect(getHrTimeClockListSurfaceKeys().length).toBe(9);
    expect(HR_TIME_CLOCK_LIST_SURFACE_KEYS[0]).toBe(
      "hr.time.clock-integration.devices.list",
    );
  });

  it("maps search params to page model fields", () => {
    for (const searchParam of HR_TIME_CLOCK_LIST_SEARCH_PARAM_MODEL_FIELDS) {
      expect(HR_TIME_CLOCK_SEARCH_PARAM_TO_PAGE_MODEL_FIELD).toHaveProperty(
        searchParam,
      );
    }
  });
});
