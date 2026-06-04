import { describe, expect, it } from "vitest";

import {
  analyzeHrSftAssignmentConflicts,
  detectHrSftAvailabilityConflicts,
  detectHrSftLeaveConflicts,
  detectHrSftOverlapConflicts,
  detectHrSftRestPeriodConflicts,
  detectHrSftWeeklyHoursConflicts,
  intervalsOverlap,
} from "../src/time-attendance/shift-scheduling/hr.time.sft-conflict.shared";
import {
  assertSftConflictRequirementCoverageComplete,
  SFT_CONFLICT_REQUIREMENT_COVERAGE,
  type HrSftShiftSlice,
} from "../src/time-attendance/shift-scheduling/hr.time.sft-conflict.schema";
import { DEFAULT_HR_SFT_SCHEDULING_POLICY } from "../src/time-attendance/shift-scheduling/hr.time.sft-policy.schema";
import { assertSftConflictPolicyCoverageComplete } from "../src/time-attendance/shift-scheduling/hr.time.sft-acceptance-coverage.shared";

function shift(overrides: Partial<HrSftShiftSlice> = {}): HrSftShiftSlice {
  return {
    employeeId: "emp_1",
    assignmentKind: "shift",
    shiftDate: new Date("2026-06-03T00:00:00.000Z"),
    shiftStart: new Date("2026-06-03T08:00:00.000Z"),
    shiftEnd: new Date("2026-06-03T16:00:00.000Z"),
    workingHoursMinutes: 480,
    ...overrides,
  };
}

describe("SFT conflict pure validators (HRM-SFT-011 … HRM-SFT-015)", () => {
  it("marks SFT-009 through SFT-015 conflict slice as shipped", () => {
    expect(() => assertSftConflictPolicyCoverageComplete()).not.toThrow();
  });

  it("covers requirement codes HRM-SFT-011 through HRM-SFT-015", () => {
    expect(() => assertSftConflictRequirementCoverageComplete()).not.toThrow();
    expect(SFT_CONFLICT_REQUIREMENT_COVERAGE.map((row) => row.code)).toEqual([
      "HRM-SFT-011",
      "HRM-SFT-012",
      "HRM-SFT-013",
      "HRM-SFT-014",
      "HRM-SFT-015",
    ]);
  });

  describe("HRM-SFT-011 availability validation", () => {
    it("flags unavailable windows when validation is enabled", () => {
      const conflicts = detectHrSftAvailabilityConflicts({
        proposed: shift(),
        availabilityWindows: [
          {
            availabilityId: "avl_1",
            employeeId: "emp_1",
            availabilityKind: "unavailable",
            startDate: new Date("2026-06-01T00:00:00.000Z"),
            endDate: new Date("2026-06-07T23:59:59.999Z"),
          },
        ],
        validateAvailabilityOnAssign: true,
      });

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.requirementCode).toBe("HRM-SFT-011");
      expect(conflicts[0]?.code).toBe("availability_unavailable");
    });

    it("ignores preferred availability and skips when policy toggle is off", () => {
      const preferredOnly = detectHrSftAvailabilityConflicts({
        proposed: shift(),
        availabilityWindows: [
          {
            availabilityId: "avl_2",
            employeeId: "emp_1",
            availabilityKind: "preferred",
            startDate: new Date("2026-06-03T00:00:00.000Z"),
            endDate: new Date("2026-06-03T23:59:59.999Z"),
          },
        ],
        validateAvailabilityOnAssign: true,
      });

      const policyOff = detectHrSftAvailabilityConflicts({
        proposed: shift(),
        availabilityWindows: [
          {
            availabilityId: "avl_3",
            employeeId: "emp_1",
            availabilityKind: "blocked",
            startDate: new Date("2026-06-03T00:00:00.000Z"),
            endDate: new Date("2026-06-03T23:59:59.999Z"),
          },
        ],
        validateAvailabilityOnAssign: false,
      });

      expect(preferredOnly).toHaveLength(0);
      expect(policyOff).toHaveLength(0);
    });
  });

  describe("HRM-SFT-012 approved leave conflict", () => {
    it("flags approved leave overlapping the shift date", () => {
      const conflicts = detectHrSftLeaveConflicts({
        proposed: shift(),
        approvedLeaves: [
          {
            leaveRequestId: "lv_1",
            employeeId: "emp_1",
            leaveType: "annual",
            startAt: new Date("2026-06-02T00:00:00.000Z"),
            endAt: new Date("2026-06-05T23:59:59.999Z"),
          },
        ],
        validateLeaveConflictOnAssign: true,
      });

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.requirementCode).toBe("HRM-SFT-012");
      expect(conflicts[0]?.relatedLeaveRequestId).toBe("lv_1");
    });
  });

  describe("HRM-SFT-013 overlapping shifts", () => {
    it("detects interval overlap between proposed and existing assignments", () => {
      expect(
        intervalsOverlap(
          new Date("2026-06-03T08:00:00.000Z"),
          new Date("2026-06-03T16:00:00.000Z"),
          new Date("2026-06-03T14:00:00.000Z"),
          new Date("2026-06-03T22:00:00.000Z"),
        ),
      ).toBe(true);

      const conflicts = detectHrSftOverlapConflicts({
        proposed: shift(),
        existingAssignments: [
          shift({
            assignmentId: "asg_existing",
            shiftStart: new Date("2026-06-03T14:00:00.000Z"),
            shiftEnd: new Date("2026-06-03T22:00:00.000Z"),
          }),
        ],
      });

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.requirementCode).toBe("HRM-SFT-013");
      expect(conflicts[0]?.relatedAssignmentId).toBe("asg_existing");
    });

    it("does not flag rest_day assignments as overlap candidates", () => {
      const conflicts = detectHrSftOverlapConflicts({
        proposed: shift({
          assignmentKind: "rest_day",
          workingHoursMinutes: 0,
        }),
        existingAssignments: [shift({ assignmentId: "asg_existing" })],
      });

      expect(conflicts).toHaveLength(0);
    });
  });

  describe("HRM-SFT-014 insufficient rest", () => {
    it("flags gaps shorter than policy minimum rest hours", () => {
      const conflicts = detectHrSftRestPeriodConflicts({
        proposed: shift({
          shiftStart: new Date("2026-06-03T20:00:00.000Z"),
          shiftEnd: new Date("2026-06-04T04:00:00.000Z"),
        }),
        existingAssignments: [
          shift({
            assignmentId: "asg_prior",
            shiftDate: new Date("2026-06-03T00:00:00.000Z"),
            shiftStart: new Date("2026-06-03T08:00:00.000Z"),
            shiftEnd: new Date("2026-06-03T16:00:00.000Z"),
          }),
        ],
        minRestHoursBetweenShifts: 11,
      });

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.requirementCode).toBe("HRM-SFT-014");
    });
  });

  describe("HRM-SFT-015 weekly hours cap", () => {
    it("flags when proposed shift pushes weekly total above policy cap", () => {
      const weekMonday = new Date("2026-06-01T00:00:00.000Z");

      const conflicts = detectHrSftWeeklyHoursConflicts({
        proposed: shift({
          shiftDate: new Date("2026-06-05T00:00:00.000Z"),
          workingHoursMinutes: 480,
        }),
        existingAssignments: [
          shift({
            assignmentId: "asg_mon",
            shiftDate: weekMonday,
            workingHoursMinutes: 600,
          }),
          shift({
            assignmentId: "asg_tue",
            shiftDate: new Date("2026-06-02T00:00:00.000Z"),
            workingHoursMinutes: 600,
          }),
          shift({
            assignmentId: "asg_wed",
            shiftDate: new Date("2026-06-03T00:00:00.000Z"),
            workingHoursMinutes: 600,
          }),
          shift({
            assignmentId: "asg_thu",
            shiftDate: new Date("2026-06-04T00:00:00.000Z"),
            workingHoursMinutes: 600,
          }),
        ],
        maxWeeklyScheduledHours: 40,
      });

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]?.requirementCode).toBe("HRM-SFT-015");
      expect(conflicts[0]?.message).toContain("40h");
    });
  });

  it("aggregates all conflict kinds via analyzeHrSftAssignmentConflicts", () => {
    const result = analyzeHrSftAssignmentConflicts({
      proposed: shift({
        shiftStart: new Date("2026-06-03T20:00:00.000Z"),
        shiftEnd: new Date("2026-06-04T04:00:00.000Z"),
      }),
      existingAssignments: [
        shift({
          assignmentId: "asg_overlap",
          shiftStart: new Date("2026-06-03T14:00:00.000Z"),
          shiftEnd: new Date("2026-06-03T22:00:00.000Z"),
        }),
      ],
      approvedLeaves: [
        {
          leaveRequestId: "lv_1",
          employeeId: "emp_1",
          leaveType: "annual",
          startAt: new Date("2026-06-03T00:00:00.000Z"),
          endAt: new Date("2026-06-03T23:59:59.999Z"),
        },
      ],
      availabilityWindows: [
        {
          availabilityId: "avl_1",
          employeeId: "emp_1",
          availabilityKind: "blocked",
          startDate: new Date("2026-06-03T00:00:00.000Z"),
          endDate: new Date("2026-06-03T23:59:59.999Z"),
        },
      ],
      policy: DEFAULT_HR_SFT_SCHEDULING_POLICY,
    });

    expect(result.hasConflicts).toBe(true);
    expect(result.requirementCodes).toEqual([
      "HRM-SFT-011",
      "HRM-SFT-012",
      "HRM-SFT-013",
      "HRM-SFT-014",
      "HRM-SFT-015",
    ]);
    expect(result.conflicts.some((row) => row.code === "availability_unavailable")).toBe(
      true,
    );
    expect(result.conflicts.some((row) => row.code === "leave_approved")).toBe(true);
    expect(result.conflicts.some((row) => row.code === "shift_overlap")).toBe(true);
  });
});
