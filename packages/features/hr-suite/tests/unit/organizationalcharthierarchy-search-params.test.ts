import { describe, expect, it } from "vitest";

import {
  HR_ORG_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_ORG_LIST_SEARCH_PARAMS_BY_KEY,
  HR_ORG_LIST_SURFACE_KEYS,
  HR_ORG_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrOrgVacanciesSurfaceKey,
  hrOrgHeadcountSurfaceKey,
  hrOrgAuditTrailSurfaceKey,
} from "../../src/metadata";
import { parseHrOrgSearchParams } from "../../src/employee-management/organizational-chart-hierarchy/data/hr.workforce.org-search-params.parse.shared";

describe("hr org workbench metadata", () => {
  it("marks vacancies, headcount, and audit trail as read-only Pattern C surfaces", () => {
    expect(
      HR_ORG_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(hrOrgVacanciesSurfaceKey),
    ).toBe(true);
    expect(
      HR_ORG_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(hrOrgHeadcountSurfaceKey),
    ).toBe(true);
    expect(
      HR_ORG_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(hrOrgAuditTrailSurfaceKey),
    ).toBe(true);
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_ORG_LIST_SURFACE_KEYS) {
      const paramKey = HR_ORG_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(HR_ORG_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
    }
  });

  it("parses list-specific search params from the metadata registry", () => {
    const paramEntries = HR_ORG_LIST_SURFACE_KEYS.map((surfaceKey) => {
      const paramKey = HR_ORG_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      return [paramKey, `${surfaceKey}-query`] as const;
    });

    expect(parseHrOrgSearchParams(Object.fromEntries(paramEntries))).toEqual({
      unitsSearch: "hr.workforce.org.units.list-query",
      positionsSearch: "hr.workforce.org.positions.list-query",
      reportingLinesSearch: "hr.workforce.org.reporting-lines.list-query",
      vacanciesSearch: "hr.workforce.org.vacancies.list-query",
      headcountSearch: "hr.workforce.org.headcount.list-query",
      auditTrailSearch: "hr.workforce.org.audit-trail.list-query",
    });
  });
});
