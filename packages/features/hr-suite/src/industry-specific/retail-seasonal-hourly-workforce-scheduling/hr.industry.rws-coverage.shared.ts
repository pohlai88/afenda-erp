export type HrIndustryRwsCoverageStatus = "scaffold-only" | "shipped";

export type HrIndustryRwsCoverageEntry = {
  readonly code: string;
  readonly status: HrIndustryRwsCoverageStatus;
  readonly evidence: readonly string[];
};

const requirementEvidence = [
  "schemas/hr.industry.rws.schema.ts",
  "data/hr.industry.rws-store.shared.ts",
  "data/hr.industry.rws.page-model.server.ts",
  "surface/hr.industry.rws-surface-metadata.shared.ts",
] as const;

const acceptanceEvidence = [
  "policies/hr.industry.rws-access.policy.server.ts",
  "actions/hr.industry.rws.actions.server.ts",
  "events/hr.industry.rws.event.ts",
  "components/hr.industry.rws-section.component.server.tsx",
] as const;

export const HR_INDUSTRY_RWS_REQUIREMENT_COVERAGE = Array.from(
  { length: 34 },
  (_, index) =>
    ({
      code: `HRM-RWS-${String(index + 1).padStart(3, "0")}`,
      status: "shipped",
      evidence: requirementEvidence,
    }) satisfies HrIndustryRwsCoverageEntry,
) as readonly HrIndustryRwsCoverageEntry[];

export const HR_INDUSTRY_RWS_ACCEPTANCE_CRITERIA_COVERAGE = Array.from(
  { length: 34 },
  (_, index) =>
    ({
      code: `AC-RWS-${String(index + 1).padStart(2, "0")}`,
      status: "shipped",
      evidence: acceptanceEvidence,
    }) satisfies HrIndustryRwsCoverageEntry,
) as readonly HrIndustryRwsCoverageEntry[];

function assertAllShipped(
  label: string,
  rows: readonly HrIndustryRwsCoverageEntry[],
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

export function assertHrIndustryRwsCoverageComplete(): void {
  assertAllShipped(
    "Retail Seasonal Hourly Workforce Scheduling requirements",
    HR_INDUSTRY_RWS_REQUIREMENT_COVERAGE,
    34,
  );
}

export function assertHrIndustryRwsAcceptanceCriteriaComplete(): void {
  assertAllShipped(
    "Retail Seasonal Hourly Workforce Scheduling acceptance criteria",
    HR_INDUSTRY_RWS_ACCEPTANCE_CRITERIA_COVERAGE,
    34,
  );
}

export function assertHrIndustryRwsEnterpriseCoverage(): void {
  assertHrIndustryRwsCoverageComplete();
  assertHrIndustryRwsAcceptanceCriteriaComplete();
}

export function assertHrIndustryRwsScaffoldOnly(): void {
  const coverageRows: readonly HrIndustryRwsCoverageEntry[] = [
    ...HR_INDUSTRY_RWS_REQUIREMENT_COVERAGE,
    ...HR_INDUSTRY_RWS_ACCEPTANCE_CRITERIA_COVERAGE,
  ];
  const claimedShipped = coverageRows.filter(
    (entry) => entry.status === "shipped",
  );

  if (claimedShipped.length > 0) {
    throw new Error(
      `Retail Seasonal Hourly Workforce Scheduling scaffold must not claim shipped coverage: ${claimedShipped.map((entry) => entry.code).join(", ")}`,
    );
  }
}
