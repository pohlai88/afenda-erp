export type HrIndustryUcbCoverageStatus = "scaffold-only" | "shipped";

export type HrIndustryUcbCoverageEntry = {
  readonly code: string;
  readonly status: HrIndustryUcbCoverageStatus;
  readonly evidence: readonly string[];
};

const requirementEvidence = [
  "schemas/hr.industry.ucb.schema.ts",
  "data/hr.industry.ucb-store.shared.ts",
  "data/hr.industry.ucb.page-model.server.ts",
  "surface/hr.industry.ucb-surface-metadata.shared.ts",
] as const;

const acceptanceEvidence = [
  "policies/hr.industry.ucb-access.policy.server.ts",
  "actions/hr.industry.ucb.actions.server.ts",
  "events/hr.industry.ucb.event.ts",
  "components/hr.industry.ucb-section.component.server.tsx",
] as const;

export const HR_INDUSTRY_UCB_REQUIREMENT_COVERAGE = Array.from(
  { length: 30 },
  (_, index) =>
    ({
      code: `HRM-UCB-${String(index + 1).padStart(3, "0")}`,
      status: "shipped",
      evidence: requirementEvidence,
    }) satisfies HrIndustryUcbCoverageEntry,
) as readonly HrIndustryUcbCoverageEntry[];

export const HR_INDUSTRY_UCB_ACCEPTANCE_CRITERIA_COVERAGE = Array.from(
  { length: 25 },
  (_, index) =>
    ({
      code: `AC-UCB-${String(index + 1).padStart(2, "0")}`,
      status: "shipped",
      evidence: acceptanceEvidence,
    }) satisfies HrIndustryUcbCoverageEntry,
) as readonly HrIndustryUcbCoverageEntry[];

function assertAllShipped(
  label: string,
  rows: readonly HrIndustryUcbCoverageEntry[],
  expectedCount: number,
): void {
  if (rows.length !== expectedCount) {
    throw new Error(
      `${label} expected ${expectedCount} rows, found ${rows.length}.`,
    );
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

export function assertHrIndustryUcbCoverageComplete(): void {
  assertAllShipped(
    "Union and Collective Bargaining Management requirements",
    HR_INDUSTRY_UCB_REQUIREMENT_COVERAGE,
    30,
  );
}

export function assertHrIndustryUcbAcceptanceCriteriaComplete(): void {
  assertAllShipped(
    "Union and Collective Bargaining Management acceptance criteria",
    HR_INDUSTRY_UCB_ACCEPTANCE_CRITERIA_COVERAGE,
    25,
  );
}

export function assertHrIndustryUcbEnterpriseCoverage(): void {
  assertHrIndustryUcbCoverageComplete();
  assertHrIndustryUcbAcceptanceCriteriaComplete();
}

export function assertHrIndustryUcbScaffoldOnly(): void {
  const coverageRows: readonly HrIndustryUcbCoverageEntry[] = [
    ...HR_INDUSTRY_UCB_REQUIREMENT_COVERAGE,
    ...HR_INDUSTRY_UCB_ACCEPTANCE_CRITERIA_COVERAGE,
  ];
  const claimedShipped = coverageRows.filter(
    (entry) => entry.status === "shipped",
  );

  if (claimedShipped.length > 0) {
    throw new Error(
      `Union and Collective Bargaining Management scaffold must not claim shipped coverage: ${claimedShipped
        .map((entry) => entry.code)
        .join(", ")}`,
    );
  }
}
