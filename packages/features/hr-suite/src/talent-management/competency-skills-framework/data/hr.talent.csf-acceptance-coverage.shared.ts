/** HRM-CSF-001 … HRM-CSF-031 requirement coverage (code-verified). */
export type CsfCoverageStatus = "shipped" | "partial" | "deferred";

export type CsfRequirementCoverage = {
  readonly code: `HRM-CSF-${string}`;
  readonly status: CsfCoverageStatus;
  readonly evidence: readonly string[];
};

export const CSF_REQUIREMENT_COVERAGE: readonly CsfRequirementCoverage[] = [
  {
    code: "HRM-CSF-001",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.talent.csf-store.shared.ts (competency library seed + listHrCsfCompetenciesFromStore)",
      "packages/features/hr-suite/.../surface/hr.talent.csf-lists.surface.ts (buildHrCsfCompetenciesListSurface)",
    ],
  },
  {
    code: "HRM-CSF-002",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.talent.csf-store.shared.ts (skill library seed + listHrCsfSkillsFromStore)",
      "packages/features/hr-suite/.../surface/hr.talent.csf-lists.surface.ts (buildHrCsfSkillsListSurface)",
    ],
  },
  {
    code: "HRM-CSF-003",
    status: "shipped",
    evidence: ["HrCsfCompetencyRecord.category (leadership, behavioral, ...)"],
  },
  {
    code: "HRM-CSF-004",
    status: "shipped",
    evidence: ["HrCsfSkillRecord.category (engineering, leadership, ...)"],
  },
  {
    code: "HRM-CSF-005",
    status: "shipped",
    evidence: ["schemas/hr.talent.csf-constants.shared.ts (HR_CSF_PROFICIENCY_LEVELS)"],
  },
  {
    code: "HRM-CSF-006",
    status: "partial",
    evidence: [
      "proficiencyScale on competency/skill records",
      "deferred: dedicated scale description table when @afenda/db schema lands",
    ],
  },
  {
    code: "HRM-CSF-007",
    status: "shipped",
    evidence: ["HrCsfRoleRequirementRecord itemKind competency"],
  },
  {
    code: "HRM-CSF-008",
    status: "shipped",
    evidence: ["HrCsfRoleRequirementRecord itemKind skill"],
  },
  {
    code: "HRM-CSF-009",
    status: "shipped",
    evidence: ["schemas/hr.talent.csf-constants.shared.ts (HR_CSF_SKILL_REQUIREMENT_KINDS)"],
  },
  {
    code: "HRM-CSF-010",
    status: "shipped",
    evidence: ["HrCsfRoleRequirementRecord.requiredLevel"],
  },
  {
    code: "HRM-CSF-011",
    status: "shipped",
    evidence: ["HrCsfEmployeeProficiencyRecord itemKind competency"],
  },
  {
    code: "HRM-CSF-012",
    status: "shipped",
    evidence: ["HrCsfEmployeeProficiencyRecord itemKind skill"],
  },
  {
    code: "HRM-CSF-013",
    status: "shipped",
    evidence: ["HrCsfEmployeeProficiencyRecord.currentLevel"],
  },
  {
    code: "HRM-CSF-014",
    status: "shipped",
    evidence: ["assessorKind self on employee proficiency seed rows"],
  },
  {
    code: "HRM-CSF-015",
    status: "shipped",
    evidence: ["assessorKind manager on employee proficiency seed rows"],
  },
  {
    code: "HRM-CSF-016",
    status: "shipped",
    evidence: ["assessorKind hr on employee proficiency seed rows"],
  },
  {
    code: "HRM-CSF-017",
    status: "shipped",
    evidence: ["lastAssessedAt, assessorKind, evidenceSummary on proficiency records"],
  },
  {
    code: "HRM-CSF-018",
    status: "shipped",
    evidence: ["HrCsfGapRecord gapKind skill + required/current levels"],
  },
  {
    code: "HRM-CSF-019",
    status: "shipped",
    evidence: ["HrCsfGapRecord gapKind competency"],
  },
  {
    code: "HRM-CSF-020",
    status: "shipped",
    evidence: ["HrCsfGapRecord severity, priority, developmentUrgency"],
  },
  {
    code: "HRM-CSF-021",
    status: "shipped",
    evidence: ["HrCsfGapRecord.recommendedActions"],
  },
  {
    code: "HRM-CSF-022",
    status: "shipped",
    evidence: ["HrCsfGapRecord.linkedCourseCodes"],
  },
  {
    code: "HRM-CSF-023",
    status: "shipped",
    evidence: [
      "contracts/hr.talent.csf-integration.contract.ts (HrCsfTrainingDevelopmentGapExposure)",
      "data/hr.talent.csf-integration.server.ts (listHrCsfTrainingDevelopmentGapExposure)",
    ],
  },
  {
    code: "HRM-CSF-024",
    status: "shipped",
    evidence: [
      "contracts/hr.talent.csf-integration.contract.ts (HrCsfLmsLearningRecommendation)",
      "data/hr.talent.csf-integration.server.ts (listHrCsfLmsLearningRecommendations)",
    ],
  },
  {
    code: "HRM-CSF-025",
    status: "shipped",
    evidence: [
      "contracts/hr.talent.csf-integration.contract.ts (HrCsfPerformanceAppraisalCompetencyRef)",
      "data/hr.talent.csf-integration.server.ts (listHrCsfPerformanceAppraisalCompetencyRefs)",
      "policies/hr.talent.csf-access.policy.server.ts (canExposePerformance)",
    ],
  },
  {
    code: "HRM-CSF-026",
    status: "shipped",
    evidence: [
      "contracts/hr.talent.csf-integration.contract.ts (HrCsfSuccessionReadinessIndicator)",
      "data/hr.talent.csf-integration.server.ts (listHrCsfSuccessionReadinessIndicators)",
      "policies/hr.talent.csf-access.policy.server.ts (canExposeSuccession, canReadReadiness)",
    ],
  },
  {
    code: "HRM-CSF-027",
    status: "shipped",
    evidence: [
      "data/hr.talent.csf-career-path.shared.ts (compareCareerPathSkillRequirements)",
      "contracts/hr.talent.csf-integration.contract.ts (HrCsfCareerPathSkillComparison)",
    ],
  },
  {
    code: "HRM-CSF-028",
    status: "shipped",
    evidence: [
      "data/hr.talent.csf-matching.server.ts (findEmployeesMatchingRequiredSkills)",
      "surface/hr.talent.csf-lists.surface.ts (buildHrCsfMatchingListSurface)",
    ],
  },
  {
    code: "HRM-CSF-029",
    status: "shipped",
    evidence: [
      "data/hr.talent.csf-reports.server.ts (buildHrCsfReportRows)",
      "surface/hr.talent.csf-lists.surface.ts (buildHrCsfReportsListSurface)",
    ],
  },
  {
    code: "HRM-CSF-030",
    status: "shipped",
    evidence: [
      "policies/hr.talent.csf-access.policy.server.ts",
      "packages/auth/src/index.ts (hr.csf.read, hr.csf.write)",
    ],
  },
  {
    code: "HRM-CSF-031",
    status: "shipped",
    evidence: [
      "events/hr.talent.csf-audit.event.ts",
      "data/hr.talent.csf-audit.server.ts",
      "surface/hr.talent.csf-lists.surface.ts (buildHrCsfAuditListSurface)",
    ],
  },
];

export const CSF_ACCEPTANCE_CRITERIA_COVERAGE = [
  { criterion: 1, requirements: ["HRM-CSF-001", "HRM-CSF-003", "HRM-CSF-005"], status: "shipped" as const },
  { criterion: 2, requirements: ["HRM-CSF-002", "HRM-CSF-004", "HRM-CSF-005"], status: "shipped" as const },
  { criterion: 3, requirements: ["HRM-CSF-006"], status: "partial" as const },
  { criterion: 4, requirements: ["HRM-CSF-007"], status: "shipped" as const },
  { criterion: 5, requirements: ["HRM-CSF-008"], status: "shipped" as const },
  { criterion: 6, requirements: ["HRM-CSF-010"], status: "shipped" as const },
  { criterion: 7, requirements: ["HRM-CSF-009"], status: "shipped" as const },
  { criterion: 8, requirements: ["HRM-CSF-012", "HRM-CSF-013"], status: "shipped" as const },
  { criterion: 9, requirements: ["HRM-CSF-011", "HRM-CSF-013"], status: "shipped" as const },
  { criterion: 10, requirements: ["HRM-CSF-014"], status: "shipped" as const },
  { criterion: 11, requirements: ["HRM-CSF-015"], status: "shipped" as const },
  { criterion: 12, requirements: ["HRM-CSF-016"], status: "shipped" as const },
  { criterion: 13, requirements: ["HRM-CSF-017"], status: "shipped" as const },
  { criterion: 14, requirements: ["HRM-CSF-018"], status: "shipped" as const },
  { criterion: 15, requirements: ["HRM-CSF-019"], status: "shipped" as const },
  { criterion: 16, requirements: ["HRM-CSF-020"], status: "shipped" as const },
  { criterion: 17, requirements: ["HRM-CSF-021"], status: "shipped" as const },
  { criterion: 18, requirements: ["HRM-CSF-022"], status: "shipped" as const },
  { criterion: 19, requirements: ["HRM-CSF-023"], status: "shipped" as const },
  { criterion: 20, requirements: ["HRM-CSF-024"], status: "shipped" as const },
  { criterion: 21, requirements: ["HRM-CSF-025"], status: "shipped" as const },
  { criterion: 22, requirements: ["HRM-CSF-026"], status: "shipped" as const },
  { criterion: 23, requirements: ["HRM-CSF-027"], status: "shipped" as const },
  { criterion: 24, requirements: ["HRM-CSF-028"], status: "shipped" as const },
  { criterion: 25, requirements: ["HRM-CSF-029"], status: "shipped" as const },
  { criterion: 26, requirements: ["HRM-CSF-030"], status: "shipped" as const },
  { criterion: 27, requirements: ["HRM-CSF-031"], status: "shipped" as const },
] as const;

export function assertCsfCoverageComplete() {
  const incomplete = CSF_REQUIREMENT_COVERAGE.filter((row) => row.status !== "shipped");
  if (incomplete.length > 0) {
    throw new Error(
      `CSF coverage incomplete: ${incomplete.map((row) => row.code).join(", ")}`,
    );
  }
}

export function assertCsfAcceptanceCriteriaComplete() {
  const incomplete = CSF_ACCEPTANCE_CRITERIA_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (incomplete.length > 0) {
    throw new Error(
      `CSF acceptance criteria incomplete: ${incomplete.map((row) => row.criterion).join(", ")}`,
    );
  }
}
