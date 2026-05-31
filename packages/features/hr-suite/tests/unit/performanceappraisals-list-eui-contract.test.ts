import { describe, expect, it } from "vitest";

import { hrTalentPerformanceReadPermission } from "../../src/talent-management/performance-appraisals/contracts/hr.talent.performance.contract";
import {
  buildHrPerformanceAppraisalsCyclesListSurface,
  buildHrPerformanceAppraisalsReviewsListSurface,
} from "../../src/talent-management/performance-appraisals/surface/hr.talent.performance-lists.surface";
import {
  createSeedHrPerformanceStore,
} from "../../src/talent-management/performance-appraisals/data/hr.talent.performance-store.shared";
import {
  hrPerformanceAppraisalsCyclesSearchParam,
  hrPerformanceAppraisalsCyclesSurfaceKey,
  hrPerformanceAppraisalsReviewsSurfaceKey,
} from "../../src/talent-management/performance-appraisals/data/hr.talent.performance-search-params.parse.shared";

describe("performance appraisals list EUI contract", () => {
  const store = createSeedHrPerformanceStore("org-1");

  it("builds cycle list surface with governed metadata and search toolbar", () => {
    const surface = buildHrPerformanceAppraisalsCyclesListSurface({
      surfaceKey: hrPerformanceAppraisalsCyclesSurfaceKey,
      rows: store.cycles,
      searchValue: "annual",
    });

    expect(surface.__schemaVersion).toBeTruthy();
    expect(surface.dataNature).toBe("table");
    expect(surface.requiresErpPermission).toEqual(
      hrTalentPerformanceReadPermission,
    );
    expect(surface.presentation.toolbar?.search?.param).toBe(
      hrPerformanceAppraisalsCyclesSearchParam,
    );
    expect(surface.presentation.toolbar?.search?.value).toBe("annual");
    expect(surface.surface.header.title).toBe("Review cycles");
    expect(surface.surface.columnsId).toBe(
      "hr.talent.performance-appraisals.cycles.columns",
    );
    expect(surface.surface.rowKey).toBe("id");
    expect(surface.pagination.totalCount).toBe(1);
  });

  it("builds review rows with route-safe row hrefs", () => {
    const surface = buildHrPerformanceAppraisalsReviewsListSurface({
      surfaceKey: hrPerformanceAppraisalsReviewsSurfaceKey,
      cycles: store.cycles,
      rows: store.reviews,
    });

    expect(surface.rows[0]?.rowHref).toBe(
      `/hr/performance-appraisals/reviews/${store.reviews[0]?.id}`,
    );
    expect(surface.rows[0]?.cells.employeeDisplayName).toBe("Alex Chen");
  });
});
