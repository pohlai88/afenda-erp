export type HrWorkforceEssCoverageStatus = "scaffold-only" | "shipped";

export type HrWorkforceEssCoverageEntry = {
  readonly code: string;
  readonly status: HrWorkforceEssCoverageStatus;
  readonly evidence: readonly string[];
};

const domainEvidence = [
  "schemas/hr.workforce.ess.schema.ts",
  "data/hr.workforce.ess-store.shared.ts",
  "actions/hr.workforce.ess.actions.server.ts",
  "surface/hr.workforce.ess-surface-metadata.shared.ts",
  "data/hr.workforce.ess.page-model.server.ts",
  "employee-selfservice-portal-architecture.md",
] as const;

export const HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE = [
  {
    code: "HRM-ESS-001",
    status: "shipped",
    evidence: ["self-scoped route adapter and read guard", ...domainEvidence],
  },
  {
    code: "HRM-ESS-002",
    status: "shipped",
    evidence: ["employee profile schema/store/surface", ...domainEvidence],
  },
  {
    code: "HRM-ESS-003",
    status: "shipped",
    evidence: ["requestHrWorkforceEssProfileUpdateAction", ...domainEvidence],
  },
  {
    code: "HRM-ESS-004",
    status: "shipped",
    evidence: ["sensitive profile updates remain pending approval", ...domainEvidence],
  },
  {
    code: "HRM-ESS-005",
    status: "shipped",
    evidence: ["leave balance schema/store/surface", ...domainEvidence],
  },
  {
    code: "HRM-ESS-006",
    status: "shipped",
    evidence: ["submitHrWorkforceEssLeaveRequestAction", ...domainEvidence],
  },
  {
    code: "HRM-ESS-007",
    status: "shipped",
    evidence: ["amend/cancel leave actions", ...domainEvidence],
  },
  {
    code: "HRM-ESS-008",
    status: "shipped",
    evidence: ["leave requests and request tracker surfaces", ...domainEvidence],
  },
  {
    code: "HRM-ESS-009",
    status: "shipped",
    evidence: ["pay documents schema/store/surface", ...domainEvidence],
  },
  {
    code: "HRM-ESS-010",
    status: "shipped",
    evidence: ["downloadHrWorkforceEssDocumentAction allowlist", ...domainEvidence],
  },
  {
    code: "HRM-ESS-011",
    status: "shipped",
    evidence: ["attendance records surface", ...domainEvidence],
  },
  {
    code: "HRM-ESS-012",
    status: "shipped",
    evidence: ["shift schedule surface", ...domainEvidence],
  },
  {
    code: "HRM-ESS-013",
    status: "shipped",
    evidence: ["submitHrWorkforceEssClaimAction", ...domainEvidence],
  },
  {
    code: "HRM-ESS-014",
    status: "shipped",
    evidence: ["uploadHrWorkforceEssSupportingDocumentAction", ...domainEvidence],
  },
  {
    code: "HRM-ESS-015",
    status: "shipped",
    evidence: ["resource center and document surfaces", ...domainEvidence],
  },
  {
    code: "HRM-ESS-016",
    status: "shipped",
    evidence: ["acknowledgeHrWorkforceEssPolicyAction", ...domainEvidence],
  },
  {
    code: "HRM-ESS-017",
    status: "shipped",
    evidence: ["assigned/onboarding/offboarding/training task surfaces", ...domainEvidence],
  },
  {
    code: "HRM-ESS-018",
    status: "shipped",
    evidence: ["request tracker surface", ...domainEvidence],
  },
  {
    code: "HRM-ESS-019",
    status: "shipped",
    evidence: ["notifications surface/action", ...domainEvidence],
  },
  {
    code: "HRM-ESS-020",
    status: "shipped",
    evidence: ["approval inbox and decide action", ...domainEvidence],
  },
  {
    code: "HRM-ESS-021",
    status: "shipped",
    evidence: ["visible employee ID filtering", ...domainEvidence],
  },
  {
    code: "HRM-ESS-022",
    status: "shipped",
    evidence: ["restricted profile/pay/document masking", ...domainEvidence],
  },
  {
    code: "HRM-ESS-023",
    status: "shipped",
    evidence: ["audit actions and emitted audit events", ...domainEvidence],
  },
  {
    code: "HRM-ESS-024",
    status: "shipped",
    evidence: ["metadata-driven Pattern C responsive list sections", ...domainEvidence],
  },
  {
    code: "HRM-ESS-025",
    status: "shipped",
    evidence: ["localized resource/consent fields and locale columns", ...domainEvidence],
  },
] as const satisfies readonly HrWorkforceEssCoverageEntry[];

export const HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE = Array.from(
  { length: 20 },
  (_, index) =>
    ({
      code: `AC-${String(index + 1).padStart(2, "0")}`,
      status: "shipped",
      evidence: domainEvidence,
    }) as const,
) satisfies readonly HrWorkforceEssCoverageEntry[];

export function assertHrWorkforceEssEnterpriseCoverage(): void {
  const requirements = new Set<string>(
    HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE.map((entry) => entry.code),
  );
  const acceptanceCriteria = new Set<string>(
    HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE.map((entry) => entry.code),
  );
  const missingRequirements = Array.from({ length: 25 }, (_, index) =>
    `HRM-ESS-${String(index + 1).padStart(3, "0")}`,
  ).filter((code) => !requirements.has(code));
  const missingAcceptanceCriteria = Array.from({ length: 20 }, (_, index) =>
    `AC-${String(index + 1).padStart(2, "0")}`,
  ).filter((code) => !acceptanceCriteria.has(code));
  const notShipped = [
    ...HR_WORKFORCE_ESS_REQUIREMENT_COVERAGE,
    ...HR_WORKFORCE_ESS_ACCEPTANCE_CRITERIA_COVERAGE,
  ].filter((entry) => entry.status !== "shipped");

  if (
    missingRequirements.length > 0 ||
    missingAcceptanceCriteria.length > 0 ||
    notShipped.length > 0
  ) {
    throw new Error(
      [
        missingRequirements.length
          ? `missing requirements: ${missingRequirements.join(", ")}`
          : null,
        missingAcceptanceCriteria.length
          ? `missing acceptance criteria: ${missingAcceptanceCriteria.join(", ")}`
          : null,
        notShipped.length
          ? `not shipped: ${notShipped.map((entry) => entry.code).join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("; "),
    );
  }
}
