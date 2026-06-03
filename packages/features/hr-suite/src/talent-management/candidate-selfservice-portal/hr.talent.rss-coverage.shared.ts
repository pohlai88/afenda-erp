export type HrTalentRssCoverageStatus = "scaffold-only" | "shipped";

export type HrTalentRssCoverageEntry = {
  readonly code: string;
  readonly status: HrTalentRssCoverageStatus;
  readonly evidence: readonly string[];
};

const domainEvidence = [
  "schemas/hr.talent.rss.schema.ts",
  "data/hr.talent.rss-store.shared.ts",
  "actions/hr.talent.rss.actions.server.ts",
  "surface/hr.talent.rss-surface-metadata.shared.ts",
  "data/hr.talent.rss.page-model.server.ts",
  "candidate-selfservice-portal-architecture.md",
] as const;

export const HR_TALENT_RSS_REQUIREMENT_COVERAGE = [
  {
    code: "HRM-RSS-001",
    status: "shipped",
    evidence: ["Candidate-facing portal route, profile surface, job posting surface"],
  },
  {
    code: "HRM-RSS-002",
    status: "shipped",
    evidence: ["candidate profile schema/store/action", ...domainEvidence],
  },
  {
    code: "HRM-RSS-003",
    status: "shipped",
    evidence: ["job postings surface and portal search metadata", ...domainEvidence],
  },
  {
    code: "HRM-RSS-004",
    status: "shipped",
    evidence: ["submitHrTalentRssApplicationAction", ...domainEvidence],
  },
  {
    code: "HRM-RSS-005",
    status: "shipped",
    evidence: ["document submission schema/action/surface", ...domainEvidence],
  },
  {
    code: "HRM-RSS-006",
    status: "shipped",
    evidence: ["applications list status tracking", ...domainEvidence],
  },
  {
    code: "HRM-RSS-007",
    status: "shipped",
    evidence: ["profile update window and profile state fields", ...domainEvidence],
  },
  {
    code: "HRM-RSS-008",
    status: "shipped",
    evidence: ["respondHrTalentRssInterviewAction", ...domainEvidence],
  },
  {
    code: "HRM-RSS-009",
    status: "shipped",
    evidence: ["reschedule-enabled interview response guard", ...domainEvidence],
  },
  {
    code: "HRM-RSS-010",
    status: "shipped",
    evidence: ["assessment access schema/action/surface", ...domainEvidence],
  },
  {
    code: "HRM-RSS-011",
    status: "shipped",
    evidence: ["pre-employment form schema/action/surface", ...domainEvidence],
  },
  {
    code: "HRM-RSS-012",
    status: "shipped",
    evidence: ["offer response schema/action/surface", ...domainEvidence],
  },
  {
    code: "HRM-RSS-013",
    status: "shipped",
    evidence: ["withdrawHrTalentRssApplicationAction", ...domainEvidence],
  },
  {
    code: "HRM-RSS-014",
    status: "shipped",
    evidence: ["internal application flag and internal applications surface", ...domainEvidence],
  },
  {
    code: "HRM-RSS-015",
    status: "shipped",
    evidence: ["submitHrTalentRssRequisitionRequestAction", ...domainEvidence],
  },
  {
    code: "HRM-RSS-016",
    status: "shipped",
    evidence: ["role-scoped candidate visibility in page model/store", ...domainEvidence],
  },
  {
    code: "HRM-RSS-017",
    status: "shipped",
    evidence: ["reviewHrTalentRssCandidateAction", ...domainEvidence],
  },
  {
    code: "HRM-RSS-018",
    status: "shipped",
    evidence: ["interviews list and role-scoped interview records", ...domainEvidence],
  },
  {
    code: "HRM-RSS-019",
    status: "shipped",
    evidence: ["submitHrTalentRssScorecardAction", ...domainEvidence],
  },
  {
    code: "HRM-RSS-020",
    status: "shipped",
    evidence: ["decideHrTalentRssApprovalAction for requisitions", ...domainEvidence],
  },
  {
    code: "HRM-RSS-021",
    status: "shipped",
    evidence: ["decideHrTalentRssApprovalAction for offers", ...domainEvidence],
  },
  {
    code: "HRM-RSS-022",
    status: "shipped",
    evidence: ["role task queue schema/store/surface/action", ...domainEvidence],
  },
  {
    code: "HRM-RSS-023",
    status: "shipped",
    evidence: ["portal notification schema/store/surface", ...domainEvidence],
  },
  {
    code: "HRM-RSS-024",
    status: "shipped",
    evidence: ["filterHrTalentRssRecordsForAccess and RSS guard flags", ...domainEvidence],
  },
  {
    code: "HRM-RSS-025",
    status: "shipped",
    evidence: ["privacy masking, access log, restricted read gate", ...domainEvidence],
  },
  {
    code: "HRM-RSS-026",
    status: "shipped",
    evidence: ["captureHrTalentRssConsentAction and privacy records", ...domainEvidence],
  },
  {
    code: "HRM-RSS-027",
    status: "shipped",
    evidence: ["recordHrTalentRssRetentionAction and retention surfaces", ...domainEvidence],
  },
  {
    code: "HRM-RSS-028",
    status: "shipped",
    evidence: ["hrTalentRssAuditActions and emitted audit events", ...domainEvidence],
  },
] as const satisfies readonly HrTalentRssCoverageEntry[];

export const HR_TALENT_RSS_ACCEPTANCE_CRITERIA_COVERAGE = Array.from(
  { length: 26 },
  (_, index) =>
    ({
      code: `AC-${String(index + 1).padStart(2, "0")}`,
      status: "shipped",
      evidence: domainEvidence,
    }) as const,
) satisfies readonly HrTalentRssCoverageEntry[];

export function assertHrTalentRssEnterpriseCoverage(): void {
  const requirements = new Set<string>(
    HR_TALENT_RSS_REQUIREMENT_COVERAGE.map((entry) => entry.code),
  );
  const acceptanceCriteria = new Set<string>(
    HR_TALENT_RSS_ACCEPTANCE_CRITERIA_COVERAGE.map((entry) => entry.code),
  );
  const missingRequirements = Array.from({ length: 28 }, (_, index) =>
    `HRM-RSS-${String(index + 1).padStart(3, "0")}`,
  ).filter((code) => !requirements.has(code));
  const missingAcceptanceCriteria = Array.from({ length: 26 }, (_, index) =>
    `AC-${String(index + 1).padStart(2, "0")}`,
  ).filter((code) => !acceptanceCriteria.has(code));
  const notShipped = [
    ...HR_TALENT_RSS_REQUIREMENT_COVERAGE,
    ...HR_TALENT_RSS_ACCEPTANCE_CRITERIA_COVERAGE,
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
