export type HrIndustryMscCoverageStatus = "scaffold-only" | "shipped";

export type HrIndustryMscCoverageEntry = {
  readonly code: string;
  readonly status: HrIndustryMscCoverageStatus;
  readonly evidence: readonly string[];
};

const requirementEvidence = [
  "schemas/hr.industry.msc.schema.ts",
  "data/hr.industry.msc-store.shared.ts",
  "data/hr.industry.msc.page-model.server.ts",
  "surface/hr.industry.msc-surface-metadata.shared.ts",
] as const;

const acceptanceEvidence = [
  "policies/hr.industry.msc-access.policy.server.ts",
  "actions/hr.industry.msc.actions.server.ts",
  "events/hr.industry.msc.event.ts",
  "components/hr.industry.msc-section.component.server.tsx",
] as const;

export const HR_INDUSTRY_MSC_REQUIREMENT_COVERAGE = Array.from(
  { length: 31 },
  (_, index) =>
    ({
      code: `HRM-MSC-${String(index + 1).padStart(3, "0")}`,
      status: "shipped",
      evidence: requirementEvidence,
    }) satisfies HrIndustryMscCoverageEntry,
) as readonly HrIndustryMscCoverageEntry[];

export const HR_INDUSTRY_MSC_ACCEPTANCE_CRITERIA_COVERAGE = Array.from(
  { length: 28 },
  (_, index) =>
    ({
      code: `AC-MSC-${String(index + 1).padStart(2, "0")}`,
      status: "shipped",
      evidence: acceptanceEvidence,
    }) satisfies HrIndustryMscCoverageEntry,
) as readonly HrIndustryMscCoverageEntry[];

function assertAllShipped(
  label: string,
  rows: readonly HrIndustryMscCoverageEntry[],
  expectedCount: number,
): void {
  if (rows.length !== expectedCount) {
    throw new Error(`${label} expected ${expectedCount} rows, found ${rows.length}.`);
  }
  const missing = rows.filter(
    (entry) => entry.status !== "shipped" || entry.evidence.length === 0,
  );
  if (missing.length > 0) {
    throw new Error(
      `${label} must be fully shipped with evidence: ${missing
        .map((entry) => entry.code)
        .join(", ")}`,
    );
  }
}

export function assertHrIndustryMscCoverageComplete(): void {
  assertAllShipped(
    "Manufacturing Safety Training OSHA Compliance requirements",
    HR_INDUSTRY_MSC_REQUIREMENT_COVERAGE,
    31,
  );
}

export function assertHrIndustryMscAcceptanceCriteriaComplete(): void {
  assertAllShipped(
    "Manufacturing Safety Training OSHA Compliance acceptance criteria",
    HR_INDUSTRY_MSC_ACCEPTANCE_CRITERIA_COVERAGE,
    28,
  );
}

export function assertHrIndustryMscEnterpriseCoverage(): void {
  assertHrIndustryMscCoverageComplete();
  assertHrIndustryMscAcceptanceCriteriaComplete();
}

export function assertHrIndustryMscScaffoldOnly(): void {
  const coverageRows: readonly HrIndustryMscCoverageEntry[] = [
    ...HR_INDUSTRY_MSC_REQUIREMENT_COVERAGE,
    ...HR_INDUSTRY_MSC_ACCEPTANCE_CRITERIA_COVERAGE,
  ];
  const claimedShipped = coverageRows.filter(
    (entry) => entry.status === "shipped",
  );

  if (claimedShipped.length > 0) {
    throw new Error(
      `Manufacturing Safety Training Osha Compliance scaffold must not claim shipped coverage: ${claimedShipped.map((entry) => entry.code).join(", ")}`,
    );
  }
}
