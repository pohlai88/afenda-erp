import { describe, expect, it } from "vitest";

import {
  computeCoverageCompareRow,
  resolveCoverageStaffingStatus,
} from "../data/hr.time.sft-coverage.shared";

describe("SFT coverage compare (HRM-SFT-016/017)", () => {
  const requirement = {
    requirementId: "cov_1",
    requirementDate: new Date("2026-06-01T00:00:00.000Z"),
    templateId: "tpl_day",
    templateCode: "DAY",
    templateName: "Day shift",
    departmentId: "dept_a",
    departmentName: "Operations",
    positionId: null,
    positionCode: null,
    locationCode: "HQ",
    roleCode: null,
    requiredSkillCode: null,
    requiredCertificationCode: null,
    minHeadcount: 3,
    maxHeadcount: 5,
  };

  it("flags understaffed shifts when assigned count is below minimum", () => {
    const row = computeCoverageCompareRow({
      requirement,
      assignments: [
        {
          assignmentId: "asg_1",
          employeeId: "emp_1",
          templateId: "tpl_day",
          departmentId: "dept_a",
          positionId: null,
          positionCode: null,
          locationCode: "HQ",
          shiftDate: new Date("2026-06-01T00:00:00.000Z"),
          status: "scheduled",
          completedQualificationCodes: [],
        },
        {
          assignmentId: "asg_2",
          employeeId: "emp_2",
          templateId: "tpl_day",
          departmentId: "dept_a",
          positionId: null,
          positionCode: null,
          locationCode: "HQ",
          shiftDate: new Date("2026-06-01T00:00:00.000Z"),
          status: "published",
          completedQualificationCodes: [],
        },
      ],
    });

    expect(row.assignedHeadcount).toBe(2);
    expect(row.deltaHeadcount).toBe(-1);
    expect(row.staffingStatus).toBe("understaffed");
  });

  it("flags overstaffed shifts when assigned count exceeds maximum", () => {
    const status = resolveCoverageStaffingStatus({
      assignedHeadcount: 6,
      minHeadcount: 3,
      maxHeadcount: 5,
    });

    expect(status).toBe("overstaffed");
  });

  it("reports balanced staffing within min/max band", () => {
    const status = resolveCoverageStaffingStatus({
      assignedHeadcount: 4,
      minHeadcount: 3,
      maxHeadcount: 5,
    });

    expect(status).toBe("balanced");
  });
});
