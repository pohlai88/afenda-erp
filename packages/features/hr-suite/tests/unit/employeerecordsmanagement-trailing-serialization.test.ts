import { describe, expect, it } from "vitest";

import { buildHrRecordsDirectoryListSurface } from "../../src/employee-management/employee-records-management/surface/hr.workforce.records-directory-list.surface";
import { buildHrRecordsSeparatedListSurface } from "../../src/employee-management/employee-records-management/surface/hr.workforce.records-separated-list.surface";

describe("records Pattern C trailing cell serialization", () => {
  it("serializes directory and separated prefill cells for trailing mutations", () => {
    const directory = buildHrRecordsDirectoryListSurface({
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
            managerDisplayName: "Jordan Lee",
            employmentStartDate: new Date("2024-01-15T00:00:00.000Z"),
            updatedAt: new Date("2024-01-15T00:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(directory.rows[0]?.cells.employeeIdValue).toBe("emp_1");
    expect(directory.rows[0]?.cells.emailValue).toBe("alex@example.com");
    expect(directory.rows[0]?.cells.legalNameValue).toBe("Alex Operator");
    expect(directory.rows[0]?.trailingAction?.state).toBe("ready");

    const separated = buildHrRecordsSeparatedListSurface({
      window: {
        rows: [
          {
            id: "emp_sep_1",
            employeeNumber: "E-099",
            displayName: "Prior Operator",
            employmentStatus: "terminated",
            departmentName: "Operations",
            positionTitle: "Analyst",
            archivedAt: new Date("2025-06-01T00:00:00.000Z"),
            employmentStartDate: new Date("2020-03-01T00:00:00.000Z"),
            updatedAt: new Date("2025-06-01T00:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(separated.rows[0]?.cells.employeeIdValue).toBe("emp_sep_1");
    expect(separated.rows[0]?.cells.employeeNumberValue).toBe("E-099");
    expect(separated.rows[0]?.cells.legalNameValue).toBe("Prior Operator");
    expect(separated.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("omits trailing actions when write is disabled", () => {
    const directory = buildHrRecordsDirectoryListSurface({
      window: {
        rows: [
          {
            id: "emp_2",
            employeeNumber: "E-101",
            displayName: "Read Only",
            email: null,
            employmentStatus: "active",
            departmentName: null,
            positionTitle: null,
            managerDisplayName: null,
            employmentStartDate: null,
            updatedAt: new Date("2024-01-15T00:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: false,
    });

    expect(directory.rows[0]?.trailingAction).toBeUndefined();
  });
});
