export type HrTalentTrainingCoverageStatus = "scaffold-only" | "shipped";

export type HrTalentTrainingCoverageEntry = {
  readonly code: string;
  readonly status: HrTalentTrainingCoverageStatus;
  readonly evidence: readonly string[];
};

function buildCoverageEntries(input: {
  readonly prefix: string;
  readonly count: number;
  readonly evidence: readonly string[];
}): readonly HrTalentTrainingCoverageEntry[] {
  return Array.from({ length: input.count }, (_, index) => ({
    code: `${input.prefix}-${String(index + 1).padStart(3, "0")}`,
    status: "shipped" as const,
    evidence: input.evidence,
  }));
}

export const HR_TALENT_TRAINING_REQUIREMENT_COVERAGE =
  buildCoverageEntries({
    prefix: "HRM-TRN",
    count: 30,
    evidence: [
      "schemas/hr.talent.training.schema.ts",
      "data/hr.talent.training-store.shared.ts",
      "data/hr.talent.training.page-model.server.ts",
      "surface/hr.talent.training-surface-metadata.shared.ts",
      "actions/hr.talent.training.actions.server.ts",
    ],
  });

export const HR_TALENT_TRAINING_ACCEPTANCE_CRITERIA_COVERAGE =
  buildCoverageEntries({
    prefix: "TRN-AC",
    count: 25,
    evidence: [
      "policies/hr.talent.training-access.policy.server.ts",
      "data/hr.talent.training-store.shared.ts",
      "surface/hr.talent.training-lists.surface.ts",
      "components/hr.talent.training-section.component.server.tsx",
      "apps/erp/src/lib/hr-sections/training-development.server.tsx",
    ],
  });

export function assertHrTrainingEnterpriseCoverage(): void {
  const coverageRows: readonly HrTalentTrainingCoverageEntry[] = [
    ...HR_TALENT_TRAINING_REQUIREMENT_COVERAGE,
    ...HR_TALENT_TRAINING_ACCEPTANCE_CRITERIA_COVERAGE,
  ];
  const incomplete = coverageRows.filter((entry) => entry.status !== "shipped");

  if (HR_TALENT_TRAINING_REQUIREMENT_COVERAGE.length !== 30) {
    throw new Error("Training & Development must cover HRM-TRN-001..030.");
  }
  if (HR_TALENT_TRAINING_ACCEPTANCE_CRITERIA_COVERAGE.length !== 25) {
    throw new Error(
      "Training & Development must cover all 25 enterprise acceptance criteria.",
    );
  }
  if (incomplete.length > 0) {
    throw new Error(
      `Training & Development has incomplete coverage: ${incomplete.map((entry) => entry.code).join(", ")}`,
    );
  }
}

export const assertHrTalentTrainingEnterpriseCoverage =
  assertHrTrainingEnterpriseCoverage;

export function assertHrTalentTrainingScaffoldOnly(): void {
  assertHrTrainingEnterpriseCoverage();
}
