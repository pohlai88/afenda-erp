/** HRM-CPM-001 … HRM-CPM-030 requirement coverage (code-verified). */
export type CpmCoverageStatus = "shipped" | "partial" | "deferred";

export type CpmRequirementCoverage = {
  readonly code: `HRM-CPM-${string}`;
  readonly status: CpmCoverageStatus;
  readonly evidence: readonly string[];
};

export const CPM_REQUIREMENT_COVERAGE: readonly CpmRequirementCoverage[] = [
  {
    code: "HRM-CPM-001",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-compensation-planning.ts (hr_compensation_cycles)",
      "packages/db/src/hr-compensation-planning.ts (createHrCompensationCycleInTx, updateHrCompensationCycleInTx, listHrCompensationCyclesWindow)",
      "packages/features/hr-suite/.../actions/hr.payroll.cpm.actions.server.ts (createCompensationCycleAction, updateCompensationCycleAction, listCompensationCyclesAction)",
    ],
  },
  {
    code: "HRM-CPM-002",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-compensation-planning.ts (hr_compensation_cycle_type enum)",
      "packages/features/hr-suite/.../schemas/hr.payroll.cpm-constants.shared.ts",
    ],
  },
  {
    code: "HRM-CPM-003",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-compensation-planning.ts (hr_compensation_budget_pools)",
      "packages/db/src/hr-compensation-planning.ts (upsertHrCompensationBudgetPoolInTx)",
      "packages/db/src/hr-compensation-planning-scope.shared.ts (assertBudgetPoolScopeFields, deriveBudgetPoolScopeRef)",
      "packages/features/hr-suite/.../schemas/hr.payroll.cpm-mutation.schema.ts (hrCpmBudgetPoolSchema superRefine)",
    ],
  },
  {
    code: "HRM-CPM-004",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-compensation-planning.ts (hr_compensation_cycle_participants)",
      "packages/db/src/hr-compensation-planning.ts (assignHrCompensationParticipantInTx, bulkAssignHrCompensationParticipantsInTx)",
      "packages/features/hr-suite/.../actions/hr.payroll.cpm.actions.server.ts (assignCompensationParticipantAction, bulkAssignCompensationParticipantsAction)",
    ],
  },
  {
    code: "HRM-CPM-005",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-compensation-planning-calculations.shared.ts (evaluateCompensationEligibility, evaluateAllCompensationEligibilityRules)",
      "packages/db/src/schema/hr-compensation-planning.ts (hr_compensation_eligibility_rules)",
      "packages/db/src/hr-compensation-planning.ts (loadActiveEligibilityRulesForCycleInTx on participant assign)",
    ],
  },
  {
    code: "HRM-CPM-006",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-compensation-planning.ts (participant salary snapshot fields)",
      "packages/db/src/hr-compensation-planning.ts (getHrCompensationParticipantContext)",
      "packages/features/hr-suite/.../surface/hr.payroll.cpm-participant-context-stat.surface.ts",
      "packages/features/hr-suite/.../components/hr.payroll.cpm-participant-section.component.server.tsx",
    ],
  },
  {
    code: "HRM-CPM-007",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-compensation-planning.ts (hr_compensation_salary_bands)",
      "packages/db/src/hr-compensation-planning-calculations.shared.ts (validateBandPosition)",
      "packages/db/src/hr-compensation-planning.ts (getHrCompensationSalaryBandContext)",
      "packages/features/hr-suite/.../surface/hr.payroll.cpm-salary-band-stat.surface.ts",
    ],
  },
  {
    code: "HRM-CPM-008",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-compensation-planning.ts (adjustment_type merit)",
      "packages/features/hr-suite/.../schemas/hr.payroll.cpm-mutation.schema.ts (hrCpmMeritRecommendationSchema)",
      "packages/features/hr-suite/.../components/hr.payroll.cpm-recommendation-form.component.client.tsx",
    ],
  },
  {
    code: "HRM-CPM-009",
    status: "shipped",
    evidence: [
      "adjustment_type promotion in hr_compensation_adjustment_type enum",
      "hrCpmPromotionRecommendationSchema",
    ],
  },
  {
    code: "HRM-CPM-010",
    status: "shipped",
    evidence: ["adjustment_type market", "hrCpmMarketRecommendationSchema"],
  },
  {
    code: "HRM-CPM-011",
    status: "shipped",
    evidence: ["adjustment_type equity", "hrCpmEquityRecommendationSchema"],
  },
  {
    code: "HRM-CPM-012",
    status: "shipped",
    evidence: [
      "adjustment_type retention",
      "hrCpmRetentionRecommendationSchema",
    ],
  },
  {
    code: "HRM-CPM-013",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-compensation-planning-calculations.shared.ts (computeProposedSalary)",
    ],
  },
  {
    code: "HRM-CPM-014",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-compensation-planning-calculations.shared.ts (computeTotalCompImpact)",
    ],
  },
  {
    code: "HRM-CPM-015",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-compensation-planning-calculations.shared.ts (computeCompensationScenario)",
      "packages/db/src/hr-compensation-planning.ts (createHrCompensationScenarioInTx)",
    ],
  },
  {
    code: "HRM-CPM-016",
    status: "shipped",
    evidence: ["validateBandPosition in hr-compensation-planning-calculations.shared.ts"],
  },
  {
    code: "HRM-CPM-017",
    status: "shipped",
    evidence: ["bandFlag below_minimum / above_maximum on recommendations"],
  },
  {
    code: "HRM-CPM-018",
    status: "shipped",
    evidence: ["computeBudgetUtilization in hr-compensation-planning-calculations.shared.ts"],
  },
  {
    code: "HRM-CPM-019",
    status: "shipped",
    evidence: ["overBudget flag on hr_compensation_recommendations"],
  },
  {
    code: "HRM-CPM-020",
    status: "shipped",
    evidence: [
      "requiresJustification + justification_required error in upsertHrCompensationRecommendationInTx",
    ],
  },
  {
    code: "HRM-CPM-021",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-compensation-planning.ts (submitHrCompensationRecommendationInTx)",
      "packages/features/hr-suite/.../actions/hr.payroll.cpm.actions.server.ts",
    ],
  },
  {
    code: "HRM-CPM-022",
    status: "shipped",
    evidence: ["reviewHrCompensationRecommendationInTx"],
  },
  {
    code: "HRM-CPM-023",
    status: "shipped",
    evidence: ["routeHrCompensationApprovalInTx + hr_compensation_approval_steps"],
  },
  {
    code: "HRM-CPM-024",
    status: "shipped",
    evidence: ["approvalRules step filtering by amount in routeHrCompensationApprovalInTx"],
  },
  {
    code: "HRM-CPM-025",
    status: "shipped",
    evidence: [
      "lockedAt on approved recommendations",
      "isHrCompensationRecommendationLocked",
    ],
  },
  {
    code: "HRM-CPM-026",
    status: "shipped",
    evidence: ["hr_compensation_salary_changes + finalizeHrCompensationApprovalInTx"],
  },
  {
    code: "HRM-CPM-027",
    status: "shipped",
    evidence: [
      "hr_compensation_payroll_refs",
      "packages/features/hr-suite/.../_integration/payroll-compensation-changes.server.ts",
    ],
  },
  {
    code: "HRM-CPM-028",
    status: "shipped",
    evidence: [
      "insertHrEmployeeRecordEventInTx in finalizeHrCompensationApprovalInTx",
      "employeeHistoryEventId on hr_compensation_salary_changes",
    ],
  },
  {
    code: "HRM-CPM-029",
    status: "shipped",
    evidence: [
      "listHrCompensationPlanningReportRows",
      "packages/features/hr-suite/.../data/hr.payroll.cpm-reports.shared.ts",
      "packages/features/hr-suite/.../data/hr.payroll.cpm.page-model.server.ts (buildHrCpmReportsPageModel)",
      "apps/erp/src/app/(workspace)/[moduleId]/compensation-planning/reports/page.tsx",
    ],
  },
  {
    code: "HRM-CPM-030",
    status: "shipped",
    evidence: [
      "hr_compensation_audit_events",
      "appendHrCompensationAuditEventInTx",
      "listHrCompensationAuditTrailWindow",
      "packages/features/hr-suite/.../data/hr.payroll.cpm.page-model.server.ts (buildHrCpmAuditPageModel)",
      "apps/erp/src/app/(workspace)/[moduleId]/compensation-planning/audit/page.tsx",
    ],
  },
];

export const CPM_ACCEPTANCE_CRITERIA_COVERAGE = [
  { criterion: 1, requirements: ["HRM-CPM-001", "HRM-CPM-002"], status: "shipped" as const },
  { criterion: 2, requirements: ["HRM-CPM-003"], status: "shipped" as const },
  { criterion: 3, requirements: ["HRM-CPM-004"], status: "shipped" as const },
  { criterion: 4, requirements: ["HRM-CPM-005"], status: "shipped" as const },
  { criterion: 5, requirements: ["HRM-CPM-006"], status: "shipped" as const },
  { criterion: 6, requirements: ["HRM-CPM-007"], status: "shipped" as const },
  { criterion: 7, requirements: ["HRM-CPM-008", "HRM-CPM-013"], status: "shipped" as const },
  { criterion: 8, requirements: ["HRM-CPM-009", "HRM-CPM-010", "HRM-CPM-011", "HRM-CPM-012"], status: "shipped" as const },
  { criterion: 9, requirements: ["HRM-CPM-013"], status: "shipped" as const },
  { criterion: 10, requirements: ["HRM-CPM-018"], status: "shipped" as const },
  { criterion: 11, requirements: ["HRM-CPM-019"], status: "shipped" as const },
  { criterion: 12, requirements: ["HRM-CPM-017"], status: "shipped" as const },
  { criterion: 13, requirements: ["HRM-CPM-020"], status: "shipped" as const },
  { criterion: 14, requirements: ["HRM-CPM-022"], status: "shipped" as const },
  { criterion: 15, requirements: ["HRM-CPM-023", "HRM-CPM-024"], status: "shipped" as const },
  { criterion: 16, requirements: ["HRM-CPM-025"], status: "shipped" as const },
  { criterion: 17, requirements: ["HRM-CPM-026"], status: "shipped" as const },
  { criterion: 18, requirements: ["HRM-CPM-027"], status: "shipped" as const },
  { criterion: 19, requirements: ["HRM-CPM-028"], status: "shipped" as const },
  { criterion: 20, requirements: ["HRM-CPM-029"], status: "shipped" as const },
  { criterion: 21, requirements: ["HR_CPM_READ/WRITE/APPROVE capabilities"], status: "shipped" as const },
  { criterion: 22, requirements: ["HRM-CPM-030"], status: "shipped" as const },
] as const;
