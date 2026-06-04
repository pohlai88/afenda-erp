import { describe, expect, it } from "vitest";

import { hrWorkforceOffboardingReadPermission } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding.contract";
import { buildHrOffboardingCasesListSurface } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-cases-list.surface";
import { buildHrOffboardingClearanceListSurface } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-clearance-list.surface";
import { hrOffboardingCasesColumnsId } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-surface-columns.shared";
import { hrOffboardingClearanceColumnsId } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-surface-columns.shared";
import { hrOffboardingCasesSurfaceKey } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-cases-list.surface";
import { hrOffboardingClearanceSurfaceKey } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-clearance-list.surface";

const emptyWindow = {
  rows: [],
  pageSize: 25,
  totalCount: 0,
  hasNextPage: false,
};

describe("offboarding Pattern C governed list EUI contract", () => {
  it("builds cases and clearance surfaces with read permission and search params", () => {
    const cases = buildHrOffboardingCasesListSurface({
      window: emptyWindow,
      canWrite: true,
    });
    const clearance = buildHrOffboardingClearanceListSurface({
      window: emptyWindow,
      canWrite: true,
    });

    expect(cases.requiresErpPermission).toBe(hrWorkforceOffboardingReadPermission);
    expect(cases.surface.columnsId).toBe(hrOffboardingCasesColumnsId);
    expect(cases.presentation!.toolbar?.search?.param).toBe("offboardingCasesSearch");

    expect(clearance.requiresErpPermission).toBe(
      hrWorkforceOffboardingReadPermission,
    );
    expect(clearance.surface.columnsId).toBe(hrOffboardingClearanceColumnsId);
    expect(clearance.presentation!.toolbar?.search?.param).toBe(
      "offboardingClearanceSearch",
    );

    expect(hrOffboardingCasesSurfaceKey).toBe("hr.workforce.offboarding.cases.list");
    expect(hrOffboardingClearanceSurfaceKey).toBe(
      "hr.workforce.offboarding.clearance.list",
    );
  });
});
