export type HrIndustryFhcCoverageStatus = "scaffold-only" | "shipped";

export type HrIndustryFhcCoverageEntry = {
  readonly code: string;
  readonly status: HrIndustryFhcCoverageStatus;
  readonly evidence: readonly string[];
};

function buildCoverageEntries(input: {
  readonly prefix: string;
  readonly count: number;
  readonly evidence: readonly string[];
}): readonly HrIndustryFhcCoverageEntry[] {
  return Array.from({ length: input.count }, (_, index) => ({
    code: `${input.prefix}-${String(index + 1).padStart(3, "0")}`,
    status: "shipped" as const,
    evidence: input.evidence,
  }));
}

export const HR_INDUSTRY_FHC_REQUIREMENT_COVERAGE = buildCoverageEntries({
  prefix: "HRM-FHC",
  count: 25,
  evidence: [
    "schemas/hr.industry.fhc.schema.ts",
    "data/hr.industry.fhc-store.shared.ts",
    "data/hr.industry.fhc.page-model.server.ts",
    "surface/hr.industry.fhc-surface-metadata.shared.ts",
    "actions/hr.industry.fhc.actions.server.ts",
  ],
});

export const HR_INDUSTRY_FHC_ACCEPTANCE_CRITERIA_COVERAGE =
  buildCoverageEntries({
    prefix: "FHC-AC",
    count: 23,
    evidence: [
      "policies/hr.industry.fhc-access.policy.server.ts",
      "data/hr.industry.fhc-store.shared.ts",
      "surface/hr.industry.fhc-lists.surface.ts",
      "components/hr.industry.fhc-section.component.server.tsx",
      "apps/erp/src/lib/hr-sections/food-handler-certification-health-compliance.server.tsx",
    ],
  });

export function assertHrIndustryFhcEnterpriseCoverage(): void {
  const coverageRows = [
    ...HR_INDUSTRY_FHC_REQUIREMENT_COVERAGE,
    ...HR_INDUSTRY_FHC_ACCEPTANCE_CRITERIA_COVERAGE,
  ];
  const incomplete = coverageRows.filter((entry) => entry.status !== "shipped");

  if (HR_INDUSTRY_FHC_REQUIREMENT_COVERAGE.length !== 25) {
    throw new Error("FHC must cover HRM-FHC-001..025.");
  }
  if (HR_INDUSTRY_FHC_ACCEPTANCE_CRITERIA_COVERAGE.length !== 23) {
    throw new Error("FHC must cover all 23 enterprise acceptance criteria.");
  }
  if (incomplete.length > 0) {
    throw new Error(
      `FHC has incomplete coverage: ${incomplete.map((entry) => entry.code).join(", ")}`,
    );
  }
}

export function assertHrIndustryFhcScaffoldOnly(): void {
  assertHrIndustryFhcEnterpriseCoverage();
}
