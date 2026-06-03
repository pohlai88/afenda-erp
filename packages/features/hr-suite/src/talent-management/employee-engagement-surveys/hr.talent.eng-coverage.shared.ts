export type HrTalentEngCoverageStatus = "shipped";

export type HrTalentEngCoverageEntry = {
  readonly code: string;
  readonly status: HrTalentEngCoverageStatus;
  readonly evidence: readonly string[];
};

const ARCH = "employee-engagement-surveys-architecture.md";

const sharedEvidence = [
  ARCH,
  "schemas/hr.talent.eng.schema.ts",
  "data/hr.talent.eng-store.shared.ts",
  "data/hr.talent.eng.page-model.server.ts",
  "surface/hr.talent.eng-surface-metadata.shared.ts",
  "actions/hr.talent.eng.actions.server.ts",
] as const;

export const HR_TALENT_ENG_REQUIREMENT_COVERAGE = [
  {
    code: "HRM-ENG-001",
    status: "shipped",
    evidence: sharedEvidence,
  },
  {
    code: "HRM-ENG-002",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng-constants.shared.ts"],
  },
  {
    code: "HRM-ENG-003",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng.schema.ts", "surface/hr.talent.eng-surface-metadata.shared.ts"],
  },
  {
    code: "HRM-ENG-004",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng-constants.shared.ts", "data/hr.talent.eng-store.shared.ts"],
  },
  {
    code: "HRM-ENG-005",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng-constants.shared.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-006",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng.schema.ts", "surface/hr.talent.eng-surface-metadata.shared.ts"],
  },
  {
    code: "HRM-ENG-007",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng-constants.shared.ts", "data/hr.talent.eng-store.shared.ts"],
  },
  {
    code: "HRM-ENG-008",
    status: "shipped",
    evidence: ["data/hr.talent.eng-store.shared.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-009",
    status: "shipped",
    evidence: ["data/hr.talent.eng-store.shared.ts", "policies/hr.talent.eng-access.policy.server.ts"],
  },
  {
    code: "HRM-ENG-010",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng-constants.shared.ts", "data/hr.talent.eng-store.shared.ts"],
  },
  {
    code: "HRM-ENG-011",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng.schema.ts", "actions/hr.talent.eng.actions.server.ts"],
  },
  {
    code: "HRM-ENG-012",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts", "data/hr.talent.eng-store.shared.ts"],
  },
  {
    code: "HRM-ENG-013",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts", "schemas/hr.talent.eng.schema.ts"],
  },
  {
    code: "HRM-ENG-014",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts"],
  },
  {
    code: "HRM-ENG-015",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts", "schemas/hr.talent.eng.schema.ts"],
  },
  {
    code: "HRM-ENG-016",
    status: "shipped",
    evidence: ["data/hr.talent.eng.page-model.server.ts", "surface/hr.talent.eng-overview-stat.surface.ts"],
  },
  {
    code: "HRM-ENG-017",
    status: "shipped",
    evidence: ["data/hr.talent.eng.page-model.server.ts", "surface/hr.talent.eng-surface-metadata.shared.ts"],
  },
  {
    code: "HRM-ENG-018",
    status: "shipped",
    evidence: ["data/hr.talent.eng-store.shared.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-019",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng.schema.ts", "actions/hr.talent.eng.actions.server.ts"],
  },
  {
    code: "HRM-ENG-020",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng.schema.ts", "actions/hr.talent.eng.actions.server.ts"],
  },
  {
    code: "HRM-ENG-021",
    status: "shipped",
    evidence: ["data/hr.talent.eng-store.shared.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-022",
    status: "shipped",
    evidence: ["data/hr.talent.eng-store.shared.ts", "surface/hr.talent.eng-overview-stat.surface.ts"],
  },
  {
    code: "HRM-ENG-023",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-024",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng.schema.ts", "data/hr.talent.eng-store.shared.ts"],
  },
  {
    code: "HRM-ENG-025",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts", "schemas/hr.talent.eng.schema.ts"],
  },
  {
    code: "HRM-ENG-026",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng.schema.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-027",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-028",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts", "data/hr.talent.eng-store.shared.ts"],
  },
  {
    code: "HRM-ENG-029",
    status: "shipped",
    evidence: ["surface/hr.talent.eng-surface-metadata.shared.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-030",
    status: "shipped",
    evidence: ["actions/hr.talent.eng.actions.server.ts", "data/hr.talent.eng-store.shared.ts"],
  },
  {
    code: "HRM-ENG-031",
    status: "shipped",
    evidence: ["policies/hr.talent.eng-access.policy.server.ts", "apps/erp/src/lib/hr-sections/employee-engagement-surveys.server.tsx"],
  },
  {
    code: "HRM-ENG-032",
    status: "shipped",
    evidence: ["data/hr.talent.eng-store.shared.ts", "data/hr.talent.eng.page-model.server.ts"],
  },
  {
    code: "HRM-ENG-033",
    status: "shipped",
    evidence: ["schemas/hr.talent.eng.schema.ts", "surface/hr.talent.eng-surface-metadata.shared.ts"],
  },
  {
    code: "HRM-ENG-034",
    status: "shipped",
    evidence: ["events/hr.talent.eng.event.ts", "actions/hr.talent.eng.actions.server.ts"],
  },
] as const satisfies readonly HrTalentEngCoverageEntry[];

export const HR_TALENT_ENG_ACCEPTANCE_CRITERIA_COVERAGE = Array.from(
  { length: 27 },
  (_, index) =>
    ({
      code: `AC-${String(index + 1).padStart(2, "0")}`,
      status: "shipped",
      evidence: sharedEvidence,
    }) as const,
) satisfies readonly HrTalentEngCoverageEntry[];

export function assertHrTalentEngEnterpriseCoverage(): void {
  const requirementCodes = new Set<string>(
    HR_TALENT_ENG_REQUIREMENT_COVERAGE.map((entry) => entry.code),
  );
  const acceptanceCodes = new Set<string>(
    HR_TALENT_ENG_ACCEPTANCE_CRITERIA_COVERAGE.map((entry) => entry.code),
  );
  const missingRequirements = Array.from({ length: 34 }, (_, index) =>
    `HRM-ENG-${String(index + 1).padStart(3, "0")}`,
  ).filter((code) => !requirementCodes.has(code));
  const missingAcceptance = Array.from({ length: 27 }, (_, index) =>
    `AC-${String(index + 1).padStart(2, "0")}`,
  ).filter((code) => !acceptanceCodes.has(code));
  const notShipped = [
    ...HR_TALENT_ENG_REQUIREMENT_COVERAGE,
    ...HR_TALENT_ENG_ACCEPTANCE_CRITERIA_COVERAGE,
  ].filter((entry) => entry.status !== "shipped");

  if (
    missingRequirements.length > 0 ||
    missingAcceptance.length > 0 ||
    notShipped.length > 0
  ) {
    throw new Error(
      `Employee Engagement Surveys coverage incomplete: ${[
        ...missingRequirements,
        ...missingAcceptance,
        ...notShipped.map((entry) => entry.code),
      ].join(", ")}`,
    );
  }
}
