import { describe, expect, it } from "vitest";

import {
  acknowledgePerformanceReview,
  assignEligibleEmployeesToPerformanceCycle,
  calculateWeightedPerformanceScore,
  createHrPerformanceCycle,
  createPerformanceGoal,
  finalizePerformanceReview,
  getPerformanceFinalizationBlockers,
  isEmployeeEligibleForPerformanceCycle,
  isPerformanceReviewLocked,
  recordCalibrationReference,
  recordPerformanceMeeting,
  resolvePerformanceApprovalWorkflow,
  submitManagerEvaluation,
  submitSelfAssessment,
} from "../../src/talent-management/performance-appraisals/data/hr.talent.performance-store.shared";

const cycle = createHrPerformanceCycle({
  id: "cycle-1",
  organizationId: "org-1",
  name: "Annual 2026",
  reviewType: "annual",
  periodStart: "2026-01-01",
  periodEnd: "2026-12-31",
  reviewStartDate: "2026-11-01",
  submissionDeadline: "2026-11-30",
  approvalDeadline: "2026-12-10",
  finalizationDate: "2026-12-20",
  status: "goal_setting",
  eligibility: {
    employmentStatuses: ["active"],
    minTenureDays: 90,
    departmentIds: ["dept-1"],
    grades: ["G5"],
    roleIds: [],
    legalEntityCodes: ["MY01"],
    employeeCategories: ["full_time"],
  },
  ratingScaleId: "default-five-point",
  requiresGoalApproval: true,
  requiresHrReview: true,
  calibrationEnabled: true,
  weightedScoringEnabled: true,
  mandatorySections: [
    "goals",
    "self_assessment",
    "manager_evaluation",
    "competency_assessment",
    "kpi_assessment",
    "meeting",
    "hr_review",
    "calibration",
  ],
});

const employees = [
  {
    employeeId: "emp-1",
    employeeDisplayName: "Alex Chen",
    employmentStatus: "active",
    hireDate: "2025-01-01",
    departmentId: "dept-1",
    departmentName: "Product",
    grade: "G5",
    roleId: "pm",
    legalEntityCode: "MY01",
    employeeCategory: "full_time",
    managerEmployeeId: "mgr-1",
  },
  {
    employeeId: "emp-2",
    employeeDisplayName: "Sam Rivera",
    employmentStatus: "probation",
    hireDate: "2026-10-01",
    departmentId: "dept-1",
    departmentName: "Product",
    grade: "G5",
    roleId: "pm",
    legalEntityCode: "MY01",
    employeeCategory: "full_time",
    managerEmployeeId: "mgr-1",
  },
  {
    employeeId: "mgr-1",
    employeeDisplayName: "Priya Raman",
    employmentStatus: "active",
    hireDate: "2022-01-01",
    departmentId: "dept-1",
    departmentName: "Product",
    grade: "G7",
    roleId: "director",
    legalEntityCode: "MY01",
    employeeCategory: "full_time",
    managerEmployeeId: null,
  },
] as const;

describe("HRM-PER workflow foundation", () => {
  it("assigns only eligible employees to a review cycle", () => {
    expect(
      isEmployeeEligibleForPerformanceCycle({
        cycle,
        employee: employees[0],
        asOfDate: "2026-11-01",
      }),
    ).toBe(true);
    expect(
      isEmployeeEligibleForPerformanceCycle({
        cycle,
        employee: employees[1],
        asOfDate: "2026-11-01",
      }),
    ).toBe(false);

    const assignments = assignEligibleEmployeesToPerformanceCycle({
      cycle,
      employees,
    });
    expect(assignments.map((assignment) => assignment.employeeId)).toEqual([
      "emp-1",
    ]);
  });

  it("calculates weighted scores from goals, competencies, KPIs, and manager rating", () => {
    const goal = createPerformanceGoal({
      id: "goal-1",
      reviewId: "cycle-1:emp-1",
      employeeId: "emp-1",
      title: "Improve quality",
      target: "Reduce defects by 20%",
      weight: 100,
      dueDate: "2026-10-31",
      progressPercent: 100,
      achievementResult: 120,
      status: "completed",
      createdByRole: "employee",
      managerApprovedAt: "2026-03-01T00:00:00.000Z",
    });

    const score = calculateWeightedPerformanceScore({
      goals: [goal],
      competencies: [{ id: "leadership", weight: 100, rating: 4 }],
      kpis: [{ id: "quality", weight: 100, rating: 4.5 }],
      managerRating: 4,
    });

    expect(score).toBeGreaterThan(4);
    expect(score).toBeLessThanOrEqual(5);
  });

  it("blocks finalization until mandatory sections are complete and locks finalized reviews", () => {
    const [baseReview] = assignEligibleEmployeesToPerformanceCycle({
      cycle,
      employees,
    });
    if (!baseReview) {
      throw new Error("Expected eligible performance review fixture.");
    }

    const goal = createPerformanceGoal({
      id: "goal-1",
      reviewId: baseReview.id,
      employeeId: baseReview.employeeId,
      title: "Improve quality",
      target: "Reduce defects by 20%",
      weight: 100,
      dueDate: "2026-10-31",
      progressPercent: 100,
      achievementResult: 120,
      status: "completed",
      createdByRole: "employee",
      managerApprovedAt: "2026-03-01T00:00:00.000Z",
    });

    const incomplete = { ...baseReview, goals: [goal] };
    expect(
      getPerformanceFinalizationBlockers({ cycle, review: incomplete }),
    ).toContain("self_assessment");

    const selfReviewed = submitSelfAssessment(incomplete, {
      selfRating: 4,
      comments: "Strong delivery",
      submittedAt: "2026-11-20T00:00:00.000Z",
    });
    const managerReviewed = submitManagerEvaluation(selfReviewed, {
      managerRating: 4,
      comments: "Consistent delivery",
      performanceSummary: "Ready for larger scope",
      recommendations: ["development", "compensation_review"],
      submittedAt: "2026-12-01T00:00:00.000Z",
    });
    const withMeeting = recordPerformanceMeeting(managerReviewed, {
      discussionDate: "2026-12-02",
      notes: "Discussed outcomes and development actions.",
    });
    const calibrated = recordCalibrationReference(
      {
        ...withMeeting,
        competencyAssessments: [{ id: "execution", weight: 100, rating: 4 }],
        kpiAssessments: [
          {
            id: "quality",
            weight: 100,
            rating: 4.5,
            target: "20%",
            result: "24%",
            achievementPercent: 120,
          },
        ],
        hrReviewSubmittedAt: "2026-12-04T00:00:00.000Z",
        approvalWorkflow: resolvePerformanceApprovalWorkflow({
          reviewId: baseReview.id,
          requiresHrReview: true,
          calibrationEnabled: true,
        }).map((step) => ({
          ...step,
          status: "approved" as const,
          decidedAt: "2026-12-05T00:00:00.000Z",
        })),
        outcome: {
          reviewId: baseReview.id,
          finalRating: 4,
          performanceCategory: "exceeds_expectations",
          promotionRecommended: false,
          compensationReviewRecommended: true,
          performanceImprovementRequired: false,
          developmentActions: ["coaching"],
          finalizedAt: null,
        },
      },
      "calibration-q4",
    );

    const finalized = finalizePerformanceReview({
      cycle,
      review: calibrated,
      finalizedAt: "2026-12-06T00:00:00.000Z",
    });
    expect(isPerformanceReviewLocked(finalized)).toBe(true);
    expect(() =>
      submitSelfAssessment(finalized, {
        selfRating: 5,
        comments: "late edit",
        submittedAt: "2026-12-07T00:00:00.000Z",
      }),
    ).toThrow("locked");

    expect(
      acknowledgePerformanceReview(finalized, "2026-12-07T00:00:00.000Z")
        .status,
    ).toBe("acknowledged");
  });
});
