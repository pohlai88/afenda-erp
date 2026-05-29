import { describe, expect, it } from "vitest";
import {
  buildHrEmployeesListSurface,
  hrEmployeesSurfaceKey,
} from "../../src/workforce/employees/surface/hr-employees-list.surface";

describe("hr workforce employees list surface", () => {
  it("builds governed list configuration with stable surface key", () => {
    const configuration = buildHrEmployeesListSurface({
      window: {
        rows: [
          {
            id: "emp_1",
            employeeNumber: "E-100",
            displayName: "Alex Operator",
            email: "alex@example.com",
            employmentStatus: "active",
            departmentName: "Operations",
            positionTitle: "Analyst",
            managerDisplayName: "Jordan Lead",
            updatedAt: new Date("2026-05-01T12:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      searchValue: "alex",
    });

    expect(hrEmployeesSurfaceKey).toBe("hr.workforce.employees.list");
    expect(configuration.rows).toHaveLength(1);
    expect(configuration.rows[0]?.cells.employee).toBe("Alex Operator");
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
    expect(configuration.pagination?.totalCount).toBe(1);
    expect(configuration.presentation?.toolbar?.search?.value).toBe("alex");
    expect(configuration.surface?.empty?.title).toBe("No employees yet");
  });
});
