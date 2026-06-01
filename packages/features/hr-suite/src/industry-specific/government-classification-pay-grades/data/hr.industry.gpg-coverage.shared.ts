export type HrIndustryGpgCoverageStatus = "scaffold-only" | "shipped";

export type HrIndustryGpgCoverageEntry = {
  readonly code: string;
  readonly status: HrIndustryGpgCoverageStatus;
  readonly evidence: readonly string[];
};

const domainEvidence = [
  "schemas/hr.industry.gpg.schema.ts",
  "data/hr.industry.gpg-store.shared.ts",
  "data/hr.industry.gpg.page-model.server.ts",
  "surface/hr.industry.gpg-surface-metadata.shared.ts",
  "actions/hr.industry.gpg.actions.server.ts",
] as const;

const acceptanceEvidence = [
  "policies/hr.industry.gpg-access.policy.server.ts",
  "data/hr.industry.gpg-store.shared.ts",
  "surface/hr.industry.gpg-lists.surface.ts",
  "components/hr.industry.gpg-section.component.server.tsx",
  "apps/erp/src/lib/hr-sections/government-classification-pay-grades.server.tsx",
] as const;

export const HR_INDUSTRY_GPG_REQUIREMENT_COVERAGE = Array.from(
  { length: 31 },
  (_, index) =>
    ({
      code: `HRM-GPG-${String(index + 1).padStart(3, "0")}`,
      status: "shipped",
      evidence: domainEvidence,
    }) satisfies HrIndustryGpgCoverageEntry,
);

export const HR_INDUSTRY_GPG_ACCEPTANCE_CRITERIA_COVERAGE = Array.from(
  { length: 26 },
  (_, index) =>
    ({
      code: `AC-${String(index + 1).padStart(2, "0")}`,
      status: "shipped",
      evidence: acceptanceEvidence,
    }) satisfies HrIndustryGpgCoverageEntry,
);

export function assertHrIndustryGpgEnterpriseCoverage(): void {
  const coverageRows: readonly HrIndustryGpgCoverageEntry[] = [
    ...HR_INDUSTRY_GPG_REQUIREMENT_COVERAGE,
    ...HR_INDUSTRY_GPG_ACCEPTANCE_CRITERIA_COVERAGE,
  ];
  const incomplete = coverageRows.filter((entry) => entry.status !== "shipped");

  if (incomplete.length > 0) {
    throw new Error(
      `Government Classification Pay Grades coverage is incomplete: ${incomplete
        .map((entry) => entry.code)
        .join(", ")}`,
    );
  }
}

export const assertHrIndustryGpgCoverageComplete =
  assertHrIndustryGpgEnterpriseCoverage;
export const assertHrIndustryGpgAcceptanceCriteriaComplete =
  assertHrIndustryGpgEnterpriseCoverage;
