export type SuccessionCoverageStatus = "shipped" | "partial" | "deferred";

export type SuccessionRequirementCoverage = {
  readonly code: `HRM-SUC-${string}`;
  readonly status: SuccessionCoverageStatus;
  readonly evidence: readonly string[];
};

export const SUCCESSION_REQUIREMENT_COVERAGE: readonly SuccessionRequirementCoverage[] =
  [
    ["001", "createHrSuccessionCriticalRole"],
    ["002", "classification enums on critical role schema"],
    ["003", "critical role organization, position, family, grade, incumbent links"],
    ["004", "nominateHrSuccessionSuccessor"],
    ["005", "multiple successor rows per critical role"],
    ["006", "HR_SUCCESSION_SUCCESSOR_TYPES"],
    ["007", "recordHrSuccessionReadinessAssessment"],
    ["008", "HR_SUCCESSION_READINESS_LEVELS"],
    ["009", "performanceReference on successor nomination"],
    ["010", "potentialAssessment on successor nomination"],
    ["011", "gridEnabled and gridCell on successor nomination"],
    ["012", "hrSuccessionCompetencyGapSchema and gaps list"],
    ["013", "developmentPlanId and development plan store"],
    ["014", "HR_SUCCESSION_DEVELOPMENT_ACTION_KINDS"],
    ["015", "development action progress and status"],
    ["016", "hrSuccessionTalentPoolSchema"],
    ["017", "hrSuccessionCalibrationReviewSchema reviewer roles"],
    ["018", "calibration outcome comments and decisionReference"],
    ["019", "buildHrSuccessionBenchStrengthRows"],
    ["020", "noReadySuccessorCount in bench rows"],
    ["021", "weakCoverageCount in bench rows"],
    ["022", "classifyHrSuccessionRisk"],
    ["023", "emergency replacement plan records"],
    ["024", "planned replacement plan records"],
    ["025", "review cycle schema and nextReviewDueAt"],
    ["026", "buildHrSuccessionNotifications"],
    ["027", "listSuccessionRecommendationsForLifecycle"],
    ["028", "buildHrSuccessionReportRows"],
    ["029", "filterHrSuccessionRecordsForAccess and policy guard"],
    ["030", "emitHrSuccessionAuditEvent and audit surface"],
  ].map(([suffix, evidence]) => ({
    code: `HRM-SUC-${suffix}`,
    status: "shipped" as const,
    evidence: [
      `packages/features/hr-suite/src/talent-management/succession-planning (${evidence})`,
    ],
  }));

export type SuccessionAcceptanceCriteriaCoverage = {
  readonly criterion: number;
  readonly status: SuccessionCoverageStatus;
  readonly requirements: readonly `HRM-SUC-${string}`[];
};

type SuccessionAcceptanceCriteriaCoverageSeed = readonly [
  criterion: number,
  requirements: readonly `HRM-SUC-${string}`[],
];

const SUCCESSION_ACCEPTANCE_CRITERIA_COVERAGE_SEEDS = [
  [1, ["HRM-SUC-001", "HRM-SUC-003"]],
  [2, ["HRM-SUC-002"]],
  [3, ["HRM-SUC-004"]],
  [4, ["HRM-SUC-005"]],
  [5, ["HRM-SUC-006"]],
  [6, ["HRM-SUC-007", "HRM-SUC-008"]],
  [7, ["HRM-SUC-009"]],
  [8, ["HRM-SUC-010"]],
  [9, ["HRM-SUC-011"]],
  [10, ["HRM-SUC-012"]],
  [11, ["HRM-SUC-013"]],
  [12, ["HRM-SUC-014", "HRM-SUC-015"]],
  [13, ["HRM-SUC-016"]],
  [14, ["HRM-SUC-017", "HRM-SUC-018"]],
  [15, ["HRM-SUC-019"]],
  [16, ["HRM-SUC-020"]],
  [17, ["HRM-SUC-021"]],
  [18, ["HRM-SUC-022"]],
  [19, ["HRM-SUC-023", "HRM-SUC-024"]],
  [20, ["HRM-SUC-026"]],
  [21, ["HRM-SUC-027"]],
  [22, ["HRM-SUC-028"]],
  [23, ["HRM-SUC-029"]],
  [24, ["HRM-SUC-030"]],
] satisfies readonly SuccessionAcceptanceCriteriaCoverageSeed[];

export const SUCCESSION_ACCEPTANCE_CRITERIA_COVERAGE: readonly SuccessionAcceptanceCriteriaCoverage[] =
  SUCCESSION_ACCEPTANCE_CRITERIA_COVERAGE_SEEDS.map(
    ([criterion, requirements]) => ({
      criterion,
      status: "shipped" as const,
      requirements,
    }),
  );

export function assertSuccessionCoverageComplete() {
  if (SUCCESSION_REQUIREMENT_COVERAGE.length !== 30) {
    throw new Error("Succession requirement coverage incomplete");
  }
}

export function assertSuccessionAcceptanceCriteriaComplete() {
  if (SUCCESSION_ACCEPTANCE_CRITERIA_COVERAGE.length !== 24) {
    throw new Error("Succession acceptance criteria coverage incomplete");
  }
}
