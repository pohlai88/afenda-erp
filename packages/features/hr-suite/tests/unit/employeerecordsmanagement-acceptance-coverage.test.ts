import { describe, expect, it } from "vitest";

import {
  HR_RECORDS_LIST_SURFACE_KEYS,
  HR_WORKFORCE_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_RECORDS_REQUIREMENT_COVERAGE,
  assertHrWorkforceRecordsEnterpriseCoverage,
} from "../../src/metadata";

describe("Employee Records Management enterprise coverage", () => {
  it("ships HRM-EMP-REC-001 through HRM-EMP-REC-020 and all architecture acceptance criteria", () => {
    expect(() => assertHrWorkforceRecordsEnterpriseCoverage()).not.toThrow();
    expect(HR_WORKFORCE_RECORDS_REQUIREMENT_COVERAGE).toHaveLength(20);
    expect(HR_WORKFORCE_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(14);
    expect(HR_RECORDS_LIST_SURFACE_KEYS).toHaveLength(7);
    expect(
      HR_WORKFORCE_RECORDS_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
    expect(
      HR_WORKFORCE_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });
});
