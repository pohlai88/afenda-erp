import { describe, expect, it } from "vitest";

import {
  HR_LIFECYCLE_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_LIFECYCLE_LIST_SEARCH_PARAMS_BY_KEY,
  HR_LIFECYCLE_LIST_SURFACE_KEYS,
  HR_LIFECYCLE_WORKBENCH_READ_ONLY_SURFACE_KEYS,
} from "../../src/metadata";
import { hrLifecycleAuditTrailSurfaceKey } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-audit-trail-list.surface";
import { hrLifecycleOnboardingCasesSurfaceKey } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-onboarding-cases-list.surface";
import { hrLifecycleOffboardingCasesSurfaceKey } from "../../src/employee-management/employee-lifecycle-management/surface/hr.workforce.lifecycle-offboarding-cases-list.surface";

describe("hr lifecycle workbench metadata", () => {
  it("registers case queues and audit trail as read-only lists", () => {
    expect(HR_LIFECYCLE_WORKBENCH_READ_ONLY_SURFACE_KEYS).toEqual(
      new Set([
        hrLifecycleAuditTrailSurfaceKey,
        hrLifecycleOnboardingCasesSurfaceKey,
        hrLifecycleOffboardingCasesSurfaceKey,
      ]),
    );
    expect(HR_LIFECYCLE_LIST_SURFACE_KEYS).toHaveLength(8);
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_LIFECYCLE_LIST_SURFACE_KEYS) {
      const paramKey = HR_LIFECYCLE_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(HR_LIFECYCLE_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
    }
    expect(
      HR_LIFECYCLE_LIST_SEARCH_PARAM_MODEL_FIELDS.lifecycleEmploymentStatus,
    ).toBe("employmentStatusFilter");
  });
});
