import { describe, expect, it } from "vitest";

import {
  HR_OFFBOARDING_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_OFFBOARDING_LIST_SEARCH_PARAMS_BY_KEY,
  HR_OFFBOARDING_LIST_SURFACE_KEYS,
  HR_OFFBOARDING_WORKBENCH_READ_ONLY_SURFACE_KEYS,
} from "../../src/metadata";
import { hrOffboardingAuditTrailSurfaceKey } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-audit-trail-list.surface";
import { hrOffboardingOverdueSurfaceKey } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-overdue-list.surface";
import { hrOffboardingSettlementSurfaceKey } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-settlement-list.surface";

describe("hr offboarding workbench metadata", () => {
  it("registers settlement, overdue, and audit as read-only lists", () => {
    expect(HR_OFFBOARDING_WORKBENCH_READ_ONLY_SURFACE_KEYS).toEqual(
      new Set([
        hrOffboardingOverdueSurfaceKey,
        hrOffboardingAuditTrailSurfaceKey,
        hrOffboardingSettlementSurfaceKey,
      ]),
    );
    expect(HR_OFFBOARDING_LIST_SURFACE_KEYS).toHaveLength(7);
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_OFFBOARDING_LIST_SURFACE_KEYS) {
      const paramKey = HR_OFFBOARDING_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(HR_OFFBOARDING_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
    }
    expect(
      HR_OFFBOARDING_LIST_SEARCH_PARAM_MODEL_FIELDS.offboardingExitTypeFilter,
    ).toBe("exitTypeFilter");
  });
});
