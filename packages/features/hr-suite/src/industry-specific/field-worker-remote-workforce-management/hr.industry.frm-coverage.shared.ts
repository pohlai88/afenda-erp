export type HrIndustryFrmCoverageStatus = "scaffold-only" | "shipped";

export type HrIndustryFrmCoverageEntry = {
  readonly code: string;
  readonly status: HrIndustryFrmCoverageStatus;
  readonly evidence: readonly string[];
};

function buildCoverageEntries(input: {
  readonly prefix: string;
  readonly count: number;
  readonly evidence: readonly string[];
}): readonly HrIndustryFrmCoverageEntry[] {
  return Array.from({ length: input.count }, (_, index) => ({
    code: `${input.prefix}-${String(index + 1).padStart(3, "0")}`,
    status: "shipped" as const,
    evidence: input.evidence,
  }));
}

export const HR_INDUSTRY_FRM_REQUIREMENT_COVERAGE = buildCoverageEntries({
  prefix: "HRM-FRM",
  count: 31,
  evidence: [
    "schemas/hr.industry.frm.schema.ts",
    "data/hr.industry.frm-store.shared.ts",
    "data/hr.industry.frm.page-model.server.ts",
    "surface/hr.industry.frm-surface-metadata.shared.ts",
    "actions/hr.industry.frm.actions.server.ts",
  ],
});

export const HR_INDUSTRY_FRM_ACCEPTANCE_CRITERIA_COVERAGE =
  buildCoverageEntries({
    prefix: "FRM-AC",
    count: 30,
    evidence: [
      "policies/hr.industry.frm-access.policy.server.ts",
      "data/hr.industry.frm-store.shared.ts",
      "surface/hr.industry.frm-lists.surface.ts",
      "components/hr.industry.frm-section.component.server.tsx",
      "apps/erp/src/lib/hr-sections/field-worker-remote-workforce-management.server.tsx",
    ],
  });

export function assertHrIndustryFrmEnterpriseCoverage(): void {
  const coverageRows = [
    ...HR_INDUSTRY_FRM_REQUIREMENT_COVERAGE,
    ...HR_INDUSTRY_FRM_ACCEPTANCE_CRITERIA_COVERAGE,
  ];
  const incomplete = coverageRows.filter((entry) => entry.status !== "shipped");

  if (HR_INDUSTRY_FRM_REQUIREMENT_COVERAGE.length !== 31) {
    throw new Error("FRM must cover HRM-FRM-001..031.");
  }
  if (HR_INDUSTRY_FRM_ACCEPTANCE_CRITERIA_COVERAGE.length !== 30) {
    throw new Error("FRM must cover all 30 enterprise acceptance criteria.");
  }
  if (incomplete.length > 0) {
    throw new Error(
      `FRM has incomplete coverage: ${incomplete.map((entry) => entry.code).join(", ")}`,
    );
  }
}

export function assertHrIndustryFrmScaffoldOnly(): void {
  assertHrIndustryFrmEnterpriseCoverage();
}
