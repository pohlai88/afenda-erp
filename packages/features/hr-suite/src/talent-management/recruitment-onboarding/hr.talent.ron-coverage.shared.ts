export type RonCoverageStatus = "shipped" | "partial" | "deferred";

export type RonRequirementCoverage = {
  readonly code: `HRM-RON-${string}`;
  readonly status: RonCoverageStatus;
  readonly evidence: readonly string[];
};

export const RON_REQUIREMENT_COVERAGE: readonly RonRequirementCoverage[] = [
  ["001", "createHrRonRequisition"],
  ["002", "HR_RON_REQUISITION_TYPES"],
  ["003", "hrRonRequisitionSchema organization links"],
  ["004", "resolveHrRonRequisitionApprovalWorkflow"],
  ["005", "assertHrRonPostingAllowed"],
  ["006", "HR_RON_POSTING_CHANNELS"],
  ["007", "publishHrRonPostingReference"],
  ["008", "submitHrRonApplication"],
  ["009", "createHrRonCandidateProfileFromApplication"],
  ["010", "HR_RON_CANDIDATE_SOURCES"],
  ["011", "resumeDocumentId and parseHrRonResumeReference"],
  ["012", "parseHrRonResumeReference extraction"],
  ["013", "evaluateHrRonScreeningAnswers"],
  ["014", "HR_RON_PIPELINE_STAGES"],
  ["015", "HR_RON_CANDIDATE_STATUSES"],
  ["016", "moveHrRonCandidateStage"],
  ["017", "scheduleHrRonInterview"],
  ["018", "buildHrRonInterviewNotifications"],
  ["019", "submitHrRonInterviewScorecard"],
  ["020", "scorecard ratings, comments, recommendations"],
  ["021", "aggregateHrRonPanelScore"],
  ["022", "assignHrRonAssessment and recordHrRonAssessmentResult"],
  ["023", "buildHrRonCandidateCommunication"],
  ["024", "createHrRonOffer"],
  ["025", "resolveHrRonOfferApprovalWorkflow"],
  ["026", "recordHrRonOfferLetterReference"],
  ["027", "HR_RON_OFFER_STATUSES"],
  ["028", "recordHrRonPreEmploymentCheck"],
  ["029", "buildHrRonCandidateConversionReference"],
  ["030", "generateHrRonOnboardingTasks"],
  ["031", "generateHrRonOnboardingTasks profile criteria"],
  ["032", "HR_RON_ONBOARDING_OWNER_ROLES"],
  ["033", "HR_RON_ONBOARDING_TASK_STATUSES"],
  ["034", "recordHrRonOnboardingDocument"],
  ["035", "recordHrRonPolicyAcknowledgment"],
  ["036", "buildHrRonReadinessSnapshot"],
  ["037", "getHrRonOnboardingCompletionBlockers"],
  ["038", "listHrRonHistoryByCandidateOrEmployee"],
  ["039", "buildHrRonReportRows"],
  ["040", "filterHrRonRecordsForAccess"],
  ["041", "emitHrRonAuditEvent"],
].map(([suffix, evidence]) => ({
  code: `HRM-RON-${suffix}`,
  status: "shipped" as const,
  evidence: [
    `packages/features/hr-suite/src/talent-management/recruitment-onboarding/data (${evidence})`,
  ],
}));

export type RonAcceptanceCriteriaCoverage = {
  readonly criterion: number;
  readonly status: RonCoverageStatus;
  readonly requirements: readonly `HRM-RON-${string}`[];
};

type RonAcceptanceCriteriaCoverageSeed = readonly [
  criterion: number,
  requirements: readonly `HRM-RON-${string}`[],
];

const RON_ACCEPTANCE_CRITERIA_COVERAGE_SEEDS = [
  [1, ["HRM-RON-001", "HRM-RON-002", "HRM-RON-003"]],
  [2, ["HRM-RON-002"]],
  [3, ["HRM-RON-004"]],
  [4, ["HRM-RON-005"]],
  [5, ["HRM-RON-006", "HRM-RON-007"]],
  [6, ["HRM-RON-008", "HRM-RON-011"]],
  [7, ["HRM-RON-009"]],
  [8, ["HRM-RON-010"]],
  [9, ["HRM-RON-012"]],
  [10, ["HRM-RON-013"]],
  [11, ["HRM-RON-014", "HRM-RON-016"]],
  [12, ["HRM-RON-015"]],
  [13, ["HRM-RON-017", "HRM-RON-018"]],
  [14, ["HRM-RON-019", "HRM-RON-020"]],
  [15, ["HRM-RON-021"]],
  [16, ["HRM-RON-022"]],
  [17, ["HRM-RON-023"]],
  [18, ["HRM-RON-024"]],
  [19, ["HRM-RON-025"]],
  [20, ["HRM-RON-027"]],
  [21, ["HRM-RON-028"]],
  [22, ["HRM-RON-029"]],
  [23, ["HRM-RON-030"]],
  [24, ["HRM-RON-031"]],
  [25, ["HRM-RON-032"]],
  [26, ["HRM-RON-033"]],
  [27, ["HRM-RON-034", "HRM-RON-035"]],
  [28, ["HRM-RON-036"]],
  [29, ["HRM-RON-037"]],
  [30, ["HRM-RON-038"]],
  [31, ["HRM-RON-039"]],
  [32, ["HRM-RON-040"]],
  [33, ["HRM-RON-041"]],
] satisfies readonly RonAcceptanceCriteriaCoverageSeed[];

export const RON_ACCEPTANCE_CRITERIA_COVERAGE: readonly RonAcceptanceCriteriaCoverage[] =
  RON_ACCEPTANCE_CRITERIA_COVERAGE_SEEDS.map(([criterion, requirements]) => ({
    criterion,
    status: "shipped" as const,
    requirements,
  }));

export function assertRonCoverageComplete() {
  if (RON_REQUIREMENT_COVERAGE.length !== 41) {
    throw new Error("Recruitment onboarding requirement coverage incomplete");
  }
  if (RON_ACCEPTANCE_CRITERIA_COVERAGE.length !== 33) {
    throw new Error(
      "Recruitment onboarding acceptance criteria coverage incomplete",
    );
  }
}
