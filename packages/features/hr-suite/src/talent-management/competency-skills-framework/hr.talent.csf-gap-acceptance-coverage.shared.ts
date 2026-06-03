/** HRM-CSF-018 … HRM-CSF-022 requirement coverage (code-verified). */
export type CsfCoverageStatus = "shipped" | "partial" | "deferred";

export type CsfRequirementCoverage = {
  readonly code: `HRM-CSF-${string}`;
  readonly status: CsfCoverageStatus;
  readonly evidence: readonly string[];
};

export const CSF_GAP_REQUIREMENT_COVERAGE: readonly CsfRequirementCoverage[] = [
  {
    code: "HRM-CSF-018",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-competency-skills-gap-calculations.shared.ts (computeSkillGap, computeProficiencyGap)",
      "packages/db/src/hr-competency-skills-gaps.ts (analyzeHrCsfEmployeeGapsInTx skill branch)",
      "packages/features/hr-suite/.../actions/hr.talent.csf-gap.actions.server.ts (computeSkillGapAction, analyzeEmployeeGapsAction)",
    ],
  },
  {
    code: "HRM-CSF-019",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-competency-skills-gap-calculations.shared.ts (computeCompetencyGap)",
      "packages/db/src/hr-competency-skills-gaps.ts (analyzeHrCsfEmployeeGapsInTx competency branch)",
      "packages/features/hr-suite/.../actions/hr.talent.csf-gap.actions.server.ts (computeCompetencyGapAction)",
    ],
  },
  {
    code: "HRM-CSF-020",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-competency-skills-gap-calculations.shared.ts (classifyGap)",
      "packages/db/src/schema/hr-competency-skills.ts (hr_csf_gap_classifications)",
      "packages/db/src/hr-competency-skills-gaps.ts (upsertHrCsfGapClassificationInTx)",
    ],
  },
  {
    code: "HRM-CSF-021",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-competency-skills-gap-calculations.shared.ts (recommendDevelopmentActions)",
      "packages/db/src/schema/hr-competency-skills.ts (hr_csf_development_recommendations)",
      "packages/db/src/hr-competency-skills-development.ts (createHrCsfDevelopmentRecommendationsInTx)",
    ],
  },
  {
    code: "HRM-CSF-022",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-competency-skills-gap-calculations.shared.ts (buildDefaultDevelopmentLinks)",
      "packages/db/src/schema/hr-competency-skills.ts (hr_csf_development_links)",
      "packages/db/src/hr-competency-skills-development.ts (linkHrCsfDevelopmentResourceInTx)",
      "packages/features/hr-suite/.../actions/hr.talent.csf-development.actions.server.ts",
    ],
  },
];

export const CSF_GAP_ACCEPTANCE_CRITERIA_COVERAGE = [
  {
    criterion: 14,
    requirements: ["HRM-CSF-018"],
    status: "shipped" as const,
  },
  {
    criterion: 15,
    requirements: ["HRM-CSF-019"],
    status: "shipped" as const,
  },
  {
    criterion: 16,
    requirements: ["HRM-CSF-020"],
    status: "shipped" as const,
  },
  {
    criterion: 17,
    requirements: ["HRM-CSF-021"],
    status: "shipped" as const,
  },
  {
    criterion: 18,
    requirements: ["HRM-CSF-022"],
    status: "shipped" as const,
  },
] as const;
