import { describe, expect, it } from "vitest";

import {
  HR_DOCUMENTS_LIST_SURFACE_KEYS,
  HR_WORKFORCE_DOCUMENTS_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_DOCUMENTS_REQUIREMENT_COVERAGE,
  assertHrWorkforceDocumentsEnterpriseCoverage,
} from "../../src/employee-management/documents-management/metadata";

describe("Documents Management enterprise coverage", () => {
  it("ships HRM-DOC-001 through HRM-DOC-025 and all acceptance criteria", () => {
    expect(() => assertHrWorkforceDocumentsEnterpriseCoverage()).not.toThrow();
    expect(HR_WORKFORCE_DOCUMENTS_REQUIREMENT_COVERAGE).toHaveLength(25);
    expect(HR_WORKFORCE_DOCUMENTS_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(
      20,
    );
    expect(HR_DOCUMENTS_LIST_SURFACE_KEYS).toHaveLength(7);
    expect(
      HR_WORKFORCE_DOCUMENTS_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
    expect(
      HR_WORKFORCE_DOCUMENTS_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });
});
