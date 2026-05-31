import { describe, expect, it } from "vitest";

import {
  getHrPerformanceAppraisalsListSurfaceKeys,
  HR_PERFORMANCE_APPRAISALS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_PERFORMANCE_APPRAISALS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_KEYS,
  HR_PERFORMANCE_APPRAISALS_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrPerformanceAppraisalsCyclesSurfaceKey,
  parseHrPerformanceAppraisalsSearchParams,
} from "../../src/talent-management/performance-appraisals/metadata";

describe("performance appraisals workbench metadata registry", () => {
  it("registers column namespaces for every list surface key", () => {
    for (const surfaceKey of HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_KEYS) {
      expect(
        HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey],
      ).toBeTruthy();
    }
    expect(getHrPerformanceAppraisalsListSurfaceKeys()).toEqual(
      HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_KEYS,
    );
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_KEYS) {
      const searchParam =
        HR_PERFORMANCE_APPRAISALS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(
        HR_PERFORMANCE_APPRAISALS_LIST_SEARCH_PARAM_MODEL_FIELDS,
      ).toContain(searchParam);
    }
  });

  it("parses performance appraisals list search params", () => {
    const parsed = parseHrPerformanceAppraisalsSearchParams({
      performanceCyclesSearch: "annual",
      performanceReviewsSearch: "alex",
      performanceReportGroupBy: "rating",
    });

    expect(parsed.performanceCyclesSearch).toBe("annual");
    expect(parsed.performanceReviewsSearch).toBe("alex");
    expect(parsed.performanceReportGroupBy).toBe("rating");
    expect(hrPerformanceAppraisalsCyclesSurfaceKey).toBe(
      "hr.talent.performance-appraisals.cycles.list",
    );
    expect(new Set(HR_PERFORMANCE_APPRAISALS_WORKBENCH_READ_ONLY_SURFACE_KEYS).size).toBe(
      HR_PERFORMANCE_APPRAISALS_WORKBENCH_READ_ONLY_SURFACE_KEYS.length,
    );
  });
});
