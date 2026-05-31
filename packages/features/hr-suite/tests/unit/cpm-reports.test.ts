import { describe, expect, it } from "vitest";

import {
  buildHrCompensationPlanningReportCsv,
  filterHrCompensationPlanningReportRows,
} from "../../src/payroll-compensation/compensation-planning-modeling/data/hr.payroll.cpm-reports.shared";

describe("HRM-CPM-029 compensation planning reports", () => {
  const sampleRows = [
    {
      cycleId: "cycle-a",
      departmentId: "dept-1",
      managerEmployeeId: "mgr-1",
      legalEntityCode: "US",
      grade: "G5",
      budgetPoolId: "pool-1",
      recommendationStatus: "submitted",
      count: 3,
    },
    {
      cycleId: "cycle-a",
      departmentId: "dept-2",
      managerEmployeeId: "mgr-2",
      legalEntityCode: "UK",
      grade: "G6",
      budgetPoolId: "pool-2",
      recommendationStatus: "approved",
      count: 1,
    },
  ] as const;

  it("filters rows by department, grade, and status", () => {
    const filtered = filterHrCompensationPlanningReportRows(sampleRows, {
      departmentId: "dept-1",
      grade: "G5",
      recommendationStatus: "submitted",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.count).toBe(3);
  });

  it("builds CSV export with header and quoted values", () => {
    const filtered = filterHrCompensationPlanningReportRows(sampleRows, {});
    const csv = buildHrCompensationPlanningReportCsv(filtered);

    expect(csv.split("\n")).toHaveLength(3);
    expect(csv).toContain("recommendation_status");
    expect(csv).toContain('"submitted"');
  });
});
