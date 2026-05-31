export type PerformanceCoverageStatus = "shipped" | "partial" | "deferred";

export type PerformanceRequirementCoverage = {
  readonly code: `HRM-PER-${string}`;
  readonly status: PerformanceCoverageStatus;
  readonly evidence: readonly string[];
};

export const PERFORMANCE_REQUIREMENT_COVERAGE: readonly PerformanceRequirementCoverage[] =
  [
    ["001", "createHrPerformanceCycle"],
    ["002", "HR_PER_REVIEW_TYPES"],
    ["003", "hrPerCycleSchema date guards"],
    ["004", "assignEligibleEmployeesToPerformanceCycle"],
    ["005", "isEmployeeEligibleForPerformanceCycle"],
    ["006", "createPerformanceGoal"],
    ["007", "assertGoalWeightsWithinPolicy"],
    ["008", "goal target and achievementResult fields"],
    ["009", "updatePerformanceGoalProgress"],
    ["010", "submitSelfAssessment"],
    ["011", "selfRating and comments schema"],
    ["012", "submitManagerEvaluation"],
    ["013", "manager rating, comments, and summary schema"],
    ["014", "calculateWeightedAssessmentScore competency inputs"],
    ["015", "calculateWeightedAssessmentScore KPI inputs"],
    ["016", "calculateWeightedPerformanceScore"],
    ["017", "HR_PER_DEFAULT_RATING_SCALE"],
    ["018", "manager evaluation recommendations"],
    ["019", "acknowledgePerformanceReview"],
    ["020", "recordPerformanceMeeting"],
    ["021", "resolvePerformanceApprovalWorkflow"],
    ["022", "requiresHrReview cycle flag"],
    ["023", "recordCalibrationReference"],
    ["024", "getPerformanceFinalizationBlockers"],
    ["025", "isPerformanceReviewLocked"],
    ["026", "listPerformanceHistoryByEmployee"],
    ["027", "buildPerformanceOutcomeReference"],
    ["028", "buildPerformanceNotifications"],
    ["029", "buildPerformanceReportRows"],
    ["030", "filterPerformanceReviewsForAccess"],
    ["031", "emitPerformanceAuditEvent"],
  ].map(([suffix, evidence]) => ({
    code: `HRM-PER-${suffix}`,
    status: "shipped" as const,
    evidence: [
      `packages/features/hr-suite/src/talent-management/performance-appraisals/data (${evidence})`,
    ],
  }));

export type PerformanceAcceptanceCriteriaCoverage = {
  readonly criterion: number;
  readonly status: PerformanceCoverageStatus;
  readonly requirements: readonly `HRM-PER-${string}`[];
};

export const PERFORMANCE_ACCEPTANCE_CRITERIA_COVERAGE: readonly PerformanceAcceptanceCriteriaCoverage[] =
  [
    [1, ["HRM-PER-001", "HRM-PER-002", "HRM-PER-003", "HRM-PER-005"]],
    [2, ["HRM-PER-004", "HRM-PER-005"]],
    [3, ["HRM-PER-006", "HRM-PER-007", "HRM-PER-008", "HRM-PER-009"]],
    [4, ["HRM-PER-006", "HRM-PER-007"]],
    [5, ["HRM-PER-010"]],
    [6, ["HRM-PER-011"]],
    [7, ["HRM-PER-012"]],
    [8, ["HRM-PER-013"]],
    [9, ["HRM-PER-014"]],
    [10, ["HRM-PER-015"]],
    [11, ["HRM-PER-016"]],
    [12, ["HRM-PER-017"]],
    [13, ["HRM-PER-024"]],
    [14, ["HRM-PER-019"]],
    [15, ["HRM-PER-020"]],
    [16, ["HRM-PER-022"]],
    [17, ["HRM-PER-023"]],
    [18, ["HRM-PER-025"]],
    [19, ["HRM-PER-027"]],
    [20, ["HRM-PER-026"]],
    [21, ["HRM-PER-029"]],
    [22, ["HRM-PER-030"]],
    [23, ["HRM-PER-028"]],
    [24, ["HRM-PER-031"]],
  ].map(([criterion, requirements]) => ({
    criterion,
    status: "shipped" as const,
    requirements,
  }));

export function assertPerformanceCoverageComplete() {
  if (PERFORMANCE_REQUIREMENT_COVERAGE.length !== 31) {
    throw new Error("Performance appraisal requirement coverage incomplete");
  }
}

export function assertPerformanceAcceptanceCriteriaComplete() {
  if (PERFORMANCE_ACCEPTANCE_CRITERIA_COVERAGE.length !== 24) {
    throw new Error(
      "Performance appraisal acceptance criteria coverage incomplete",
    );
  }
}
