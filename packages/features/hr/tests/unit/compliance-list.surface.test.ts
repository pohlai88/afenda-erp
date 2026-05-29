import { describe, expect, it } from "vitest";
import {
  buildHrComplianceExceptionsListSurface,
  hrComplianceExceptionsSurfaceKey,
} from "../../src/workforce/compliance/surface/hr-compliance-exceptions-list.surface";
import {
  buildHrComplianceObligationsListSurface,
  hrComplianceObligationsSurfaceKey,
} from "../../src/workforce/compliance/surface/hr-compliance-obligations-list.surface";

describe("hr workforce compliance list surfaces", () => {
  it("builds obligations list with stable surface key", () => {
    const configuration = buildHrComplianceObligationsListSurface({
      window: {
        rows: [
          {
            id: "obl_1",
            code: "PDPA-01",
            title: "Data protection register",
            description: null,
            complianceArea: "privacy",
            requirementKind: "registration",
            status: "active",
            departmentName: "Legal",
            dueDate: new Date("2026-12-31T00:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      searchValue: "pdpa",
    });

    expect(hrComplianceObligationsSurfaceKey).toBe(
      "hr.workforce.compliance.obligations.list",
    );
    expect(configuration.rows).toHaveLength(1);
    expect(configuration.rows[0]?.cells.code).toBe("PDPA-01");
  });

  it("builds exceptions list with employee row href", () => {
    const configuration = buildHrComplianceExceptionsListSurface({
      window: {
        rows: [
          {
            id: "exc_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            complianceArea: "safety",
            itemType: "training_gap",
            title: "Missing induction",
            severity: "high",
            status: "open",
            correctiveActionDueDate: null,
            createdAt: new Date("2026-05-01T12:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
    });

    expect(hrComplianceExceptionsSurfaceKey).toBe(
      "hr.workforce.compliance.exceptions.list",
    );
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
    expect(configuration.surface?.empty?.title).toBe("No open exceptions");
  });
});
