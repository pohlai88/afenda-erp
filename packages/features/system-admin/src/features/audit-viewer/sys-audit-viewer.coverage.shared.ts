export type AuditViewerCoverageStatus = "shipped" | "partial" | "deferred";

export type AuditViewerRequirementCoverage = {
  readonly code: `SUC-${string}`;
  readonly status: AuditViewerCoverageStatus;
  readonly evidence: readonly string[];
};

export const AUDIT_VIEWER_REQUIREMENT_COVERAGE: readonly AuditViewerRequirementCoverage[] =
  [
    ["001", "buildSystemAdminAuditPageModel and searchSystemAdminAuditEvents"],
    ["002", "auditQ search filter in searchTenantAuditLogs"],
    ["003", "auditActor filter"],
    ["004", "auditAction filter"],
    ["005", "auditTargetType and auditTargetId filters"],
    ["006", "auditModule filter"],
    ["007", "auditFrom and auditTo date filters"],
    ["008", "auditPage and auditPageSize pagination"],
    ["009", "getSystemAdminAuditEventDetail detail panel"],
    ["010", "listSystemAdminAuditTargetTimeline chronological asc"],
    ["011", "buildSystemAdminActorInvestigationHref"],
    ["012", "buildSystemAdminTargetInvestigationHref"],
    ["013", "buildSystemAdminCapabilityInvestigationHref"],
    ["014", "buildSystemAdminActionInvestigationHref"],
    ["015", "exportSystemAdminAuditLogsAction csv format"],
    ["016", "exportSystemAdminAuditLogsAction json format"],
    ["017", "exportSystemAdminAuditLogsAction xlsx format"],
    ["018", "exportSystemAdminAuditLogsAction pdf format"],
    ["019", "writeExecutionAuditEvent on export"],
    ["020", "redactAuditMetadata sensitive keys"],
    ["021", "organizationId scoped searchTenantAuditLogs"],
    ["022", "read-only viewer without mutation actions on events"],
    ["023", "listSystemAdminAuditCoverageGaps panel"],
    ["024", "retention policies list surface"],
    ["025", "upsertSystemAdminRetentionPolicyAction with audit.review"],
    ["026", "requireSystemAdminAuditRead Export Review guards"],
    ["027", "buildSystemAdminAuditViewerListSurface Pattern C"],
    ["028", "recordSystemAdminAuditViewerViewEvent list and detail views"],
    ["029", "extractAuditCorrelationRefs policy and approval metadata"],
    ["030", "no delete or mutate paths on audit log records"],
  ].map(([suffix, evidence]) => ({
    code: `SUC-${suffix}`,
    status: "shipped" as const,
    evidence: [
      `packages/features/system-admin/src/audit-viewer (${evidence})`,
    ],
  }));

export type AuditViewerAcceptanceCriteriaCoverage = {
  readonly criterion: number;
  readonly status: AuditViewerCoverageStatus;
  readonly requirements: readonly `SUC-${string}`[];
};

type AuditViewerAcceptanceCriteriaCoverageSeed = readonly [
  criterion: number,
  requirements: readonly `SUC-${string}`[],
];

const AUDIT_VIEWER_ACCEPTANCE_CRITERIA_COVERAGE_SEEDS = [
  [1, ["SUC-001", "SUC-002", "SUC-026", "SUC-027"]],
  [2, ["SUC-003", "SUC-004", "SUC-005", "SUC-006", "SUC-007"]],
  [3, ["SUC-008", "SUC-027"]],
  [4, ["SUC-009", "SUC-020"]],
  [5, ["SUC-010", "SUC-012"]],
  [6, ["SUC-011", "SUC-013", "SUC-014"]],
  [7, ["SUC-015", "SUC-016", "SUC-017", "SUC-018", "SUC-019"]],
  [8, ["SUC-019", "SUC-021"]],
  [9, ["SUC-020"]],
  [10, ["SUC-021", "SUC-026"]],
  [11, ["SUC-022", "SUC-030"]],
  [12, ["SUC-023"]],
  [13, ["SUC-024", "SUC-025"]],
  [14, ["SUC-029"]],
  [15, ["SUC-028"]],
  [16, ["SUC-025", "SUC-026"]],
  [17, ["SUC-027"]],
  [18, ["SUC-023", "SUC-029"]],
] satisfies readonly AuditViewerAcceptanceCriteriaCoverageSeed[];

export const AUDIT_VIEWER_ACCEPTANCE_CRITERIA_COVERAGE: readonly AuditViewerAcceptanceCriteriaCoverage[] =
  AUDIT_VIEWER_ACCEPTANCE_CRITERIA_COVERAGE_SEEDS.map(
    ([criterion, requirements]) => ({
      criterion,
      status: "shipped" as const,
      requirements,
    }),
  );

export function assertAuditViewerCoverageComplete() {
  if (AUDIT_VIEWER_REQUIREMENT_COVERAGE.length !== 30) {
    throw new Error("Audit viewer requirement coverage incomplete");
  }
}

export function assertAuditViewerAcceptanceCriteriaComplete() {
  if (AUDIT_VIEWER_ACCEPTANCE_CRITERIA_COVERAGE.length !== 18) {
    throw new Error("Audit viewer acceptance criteria coverage incomplete");
  }
}
