import { describe, expect, it } from "vitest";

import {
  getHrRonListSurfaceKeys,
  HR_RON_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_RON_LIST_SEARCH_PARAMS_BY_KEY,
  HR_RON_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_RON_LIST_SURFACE_KEYS,
  HR_RON_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrRonRequisitionsSurfaceKey,
  parseHrRonSearchParams,
} from "../../src/talent-management/recruitment-onboarding/metadata";

describe("recruitment onboarding workbench metadata registry", () => {
  it("registers column namespaces for every list surface key", () => {
    for (const surfaceKey of HR_RON_LIST_SURFACE_KEYS) {
      expect(HR_RON_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey]).toBeTruthy();
    }
    expect(getHrRonListSurfaceKeys()).toEqual(HR_RON_LIST_SURFACE_KEYS);
  });

  it("maps every search param to a page-model field", () => {
    for (const surfaceKey of HR_RON_LIST_SURFACE_KEYS) {
      const searchParam = HR_RON_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(Object.keys(HR_RON_LIST_SEARCH_PARAM_MODEL_FIELDS)).toContain(
        searchParam,
      );
    }
  });

  it("parses list search params and defaults invalid report grouping", () => {
    const parsed = parseHrRonSearchParams({
      recruitmentRequisitionsSearch: "ops",
      recruitmentApplicationsSearch: "avery",
      recruitmentReportGroupBy: "not-valid",
    });

    expect(parsed.requisitionsSearch).toBe("ops");
    expect(parsed.applicationsSearch).toBe("avery");
    expect(parsed.reportGroupBy).toBe("stage");
    expect(hrRonRequisitionsSurfaceKey).toBe(
      "hr.talent.recruitment-onboarding.requisitions.list",
    );
    expect(new Set(HR_RON_WORKBENCH_READ_ONLY_SURFACE_KEYS).size).toBe(
      HR_RON_WORKBENCH_READ_ONLY_SURFACE_KEYS.length,
    );
  });
});
