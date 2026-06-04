import { describe, expect, it } from "vitest";

import {
  HR_BENEFITS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_BENEFITS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_BENEFITS_LIST_SURFACE_KEYS,
  HR_BENEFITS_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrBenefitsAuditTrailSurfaceKey,
} from "../../src/metadata";
import { parseHrBenefitsSearchParams } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-search-params.parse.shared";

describe("hr benefits workbench metadata", () => {
  it("marks audit trail as read-only Pattern C surface", () => {
    expect(
      HR_BENEFITS_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(
        hrBenefitsAuditTrailSurfaceKey,
      ),
    ).toBe(true);
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_BENEFITS_LIST_SURFACE_KEYS) {
      const paramKey = HR_BENEFITS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(HR_BENEFITS_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
    }
  });

  it("parses list-specific search params from the metadata registry", () => {
    const paramEntries = HR_BENEFITS_LIST_SURFACE_KEYS.map((surfaceKey) => {
      const paramKey = HR_BENEFITS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      return [paramKey, `${surfaceKey}-query`] as const;
    });

    expect(parseHrBenefitsSearchParams(Object.fromEntries(paramEntries))).toEqual({
      plansSearch: "hr.payroll.benefits.plans.list-query",
      eligibilityRulesSearch: "hr.payroll.benefits.eligibility-rules.list-query",
      openEnrollmentSearch: "hr.payroll.benefits.open-enrollment.list-query",
      enrollmentsSearch: "hr.payroll.benefits.enrollments.list-query",
      providersSearch: "hr.payroll.benefits.providers.list-query",
      auditTrailSearch: "hr.payroll.benefits.audit-trail.list-query",
    });
  });
});
