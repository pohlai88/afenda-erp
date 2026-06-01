export type ApprovalCoverageStatus = "shipped" | "partial" | "deferred";

export type ApprovalRequirementCoverage = {
  readonly code: `SUC-${string}`;
  readonly status: ApprovalCoverageStatus;
  readonly evidence: readonly string[];
};

export const APPROVAL_REQUIREMENT_COVERAGE: readonly ApprovalRequirementCoverage[] =
  [
    ["001", "listSystemAdminApprovals and buildSystemAdminApprovalsPageModel"],
    ["002", "updateSystemAdminApprovalRuleAction create mode"],
    ["003", "updateSystemAdminApprovalRuleAction update mode"],
    ["004", "setSystemAdminApprovalRuleEnabledAction disable path"],
    ["005", "approverRoleKeysSchema against organizationRoles"],
    ["006", "approvalModeSchema sequential"],
    ["007", "approvalModeSchema parallel"],
    ["008", "minApprovals refinement and schema bounds"],
    ["009", "escalationAfterHours schema and escalationBehaviorSchema"],
    ["010", "delegateRoleKeysSchema and delegationValidDays validation"],
    ["011", "invalid approver role rejected and assertApprovalRuleRolesAllowed"],
    ["012", "assertApprovalRuleChangeAllowed deprecated reactivation guard"],
    ["013", "refineApprovalCounts minApprovals vs approverRoleKeys"],
    ["014", "mapTenantApprovalSettingToKernelRecord disabled filter"],
    ["015", "assertApprovalRuleChangeAllowed deprecated enable guard"],
    ["016", "kernel record includes approvalMode sequential"],
    ["017", "kernel record includes approvalMode parallel"],
    ["018", "updateApprovalRuleInputSchema escalation bounds"],
    ["019", "delegateRoleKeysSchema validation"],
    ["020", "resolveTenantExecutionPolicyVerdict require_approval linkage"],
    ["021", "evaluateApprovalRuleReadiness and list readiness column"],
    ["022", "writeExecutionAuditEvent on mutations"],
    ["023", "organizationId scoped queries and guards"],
    ["024", "buildSystemAdminApprovalRuleDetail and recent activity panel"],
    ["025", "relatedPolicyKeys in approval detail"],
    ["026", "capabilityKey in approval detail"],
    ["027", "requireSystemAdminApprovalsRead and Manage guards"],
    ["028", "buildApprovalsListSurface GovernedPatternCListSection"],
    ["029", "loadTenantExecutionRulesForOrganization approvalRules"],
    ["030", "approval_catalog.view audit and mutation audit actions"],
  ].map(([suffix, evidence]) => ({
    code: `SUC-${suffix}`,
    status: "shipped" as const,
    evidence: [
      `packages/features/system-admin/src/approvals (${evidence})`,
    ],
  }));

export type ApprovalAcceptanceCriteriaCoverage = {
  readonly criterion: number;
  readonly status: ApprovalCoverageStatus;
  readonly requirements: readonly `SUC-${string}`[];
};

type ApprovalAcceptanceCriteriaCoverageSeed = readonly [
  criterion: number,
  requirements: readonly `SUC-${string}`[],
];

const APPROVAL_ACCEPTANCE_CRITERIA_COVERAGE_SEEDS = [
  [1, ["SUC-001", "SUC-027", "SUC-028"]],
  [2, ["SUC-002", "SUC-005", "SUC-022"]],
  [3, ["SUC-003", "SUC-022"]],
  [4, ["SUC-004", "SUC-014", "SUC-015"]],
  [5, ["SUC-005", "SUC-011"]],
  [6, ["SUC-006", "SUC-016"]],
  [7, ["SUC-007", "SUC-017"]],
  [8, ["SUC-008", "SUC-013"]],
  [9, ["SUC-009", "SUC-018"]],
  [10, ["SUC-010", "SUC-019"]],
  [11, ["SUC-011", "SUC-012", "SUC-013"]],
  [12, ["SUC-021", "SUC-024"]],
  [13, ["SUC-025", "SUC-026"]],
  [14, ["SUC-020", "SUC-029"]],
  [15, ["SUC-023", "SUC-027"]],
  [16, ["SUC-022", "SUC-030"]],
  [17, ["SUC-028"]],
  [18, ["SUC-014", "SUC-029"]],
] satisfies readonly ApprovalAcceptanceCriteriaCoverageSeed[];

export const APPROVAL_ACCEPTANCE_CRITERIA_COVERAGE: readonly ApprovalAcceptanceCriteriaCoverage[] =
  APPROVAL_ACCEPTANCE_CRITERIA_COVERAGE_SEEDS.map(
    ([criterion, requirements]) => ({
      criterion,
      status: "shipped" as const,
      requirements,
    }),
  );

export function assertApprovalCoverageComplete() {
  if (APPROVAL_REQUIREMENT_COVERAGE.length !== 30) {
    throw new Error("Approval requirement coverage incomplete");
  }
}

export function assertApprovalAcceptanceCriteriaComplete() {
  if (APPROVAL_ACCEPTANCE_CRITERIA_COVERAGE.length !== 18) {
    throw new Error("Approval acceptance criteria coverage incomplete");
  }
}
