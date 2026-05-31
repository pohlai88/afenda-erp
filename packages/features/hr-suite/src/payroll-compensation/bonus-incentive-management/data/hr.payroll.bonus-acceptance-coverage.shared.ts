/** HRM-BON-001 … HRM-BON-030 shipment matrix (code-verified). */
export type BonusCoverageStatus = "shipped" | "partial" | "deferred";

export type BonusRequirementCoverage = {
  readonly code: `HRM-BON-${string}`;
  readonly status: BonusCoverageStatus;
  readonly evidence: readonly string[];
};

export const BONUS_FOUNDATION_REQUIREMENT_COVERAGE: readonly BonusRequirementCoverage[] =
  [
    {
      code: "HRM-BON-001",
      status: "shipped",
      evidence: [
        "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_plans)",
        "packages/db/src/hr-bonus-plans.ts (listHrBonusPlansWindow, upsertHrBonusPlanInTx, archiveHrBonusPlanInTx)",
        "packages/features/hr-suite/.../actions/hr.payroll.bonus-foundation.actions.server.ts (upsertBonusPlanAction)",
        "packages/features/hr-suite/.../surface/hr.payroll.bonus-foundation-lists.surface.ts (plans list)",
      ],
    },
    {
      code: "HRM-BON-002",
      status: "shipped",
      evidence: [
        "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_plan_type enum — 9 plan types)",
        "packages/features/hr-suite/.../schemas/hr.payroll.bonus-constants.shared.ts (HR_BONUS_PLAN_TYPES)",
      ],
    },
    {
      code: "HRM-BON-003",
      status: "shipped",
      evidence: [
        "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_eligibility_rules)",
        "packages/db/src/hr-bonus-eligibility.ts (upsertHrBonusEligibilityRuleInTx, determineHrBonusEligibility)",
        "packages/db/src/hr-bonus-scope.shared.ts (appliesBonusEligibilityRuleToEmployee)",
        "packages/features/hr-suite/.../actions/hr.payroll.bonus-foundation.actions.server.ts (upsertBonusEligibilityRuleAction)",
      ],
    },
    {
      code: "HRM-BON-004",
      status: "shipped",
      evidence: [
        "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_plan_participants)",
        "packages/db/src/hr-bonus-participants.ts (assignHrBonusPlanParticipantInTx with eligibility flagging)",
        "packages/features/hr-suite/.../actions/hr.payroll.bonus-foundation.actions.server.ts (assignBonusPlanParticipantAction)",
      ],
    },
    {
      code: "HRM-BON-005",
      status: "shipped",
      evidence: [
        "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_cycles with period/cutoff/approval/payout dates)",
        "packages/db/src/hr-bonus-cycles.ts (upsertHrBonusCycleInTx, listHrBonusCyclesWindow)",
        "packages/features/hr-suite/.../actions/hr.payroll.bonus-foundation.actions.server.ts (upsertBonusCycleAction)",
      ],
    },
    {
      code: "HRM-BON-006",
      status: "shipped",
      evidence: [
        "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_targets, hr_bonus_target_kind enum)",
        "packages/db/src/hr-bonus-targets.ts (upsertHrBonusTargetInTx, listHrBonusTargetsWindow)",
        "packages/db/src/hr-bonus-scope.shared.ts (buildBonusTargetScopeKey)",
        "packages/features/hr-suite/.../actions/hr.payroll.bonus-foundation.actions.server.ts (upsertBonusTargetAction)",
      ],
    },
  ];

export const BONUS_REQUIREMENT_COVERAGE: readonly BonusRequirementCoverage[] = [
  ...BONUS_FOUNDATION_REQUIREMENT_COVERAGE,
  {
    code: "HRM-BON-007",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_target_achievements)",
      "packages/db/src/hr-bonus-incentive-achievements.ts (recordHrBonusTargetAchievementInTx)",
      "packages/features/hr-suite/.../actions/hr.payroll.bonus.actions.server.ts (recordBonusTargetAchievementAction)",
    ],
  },
  {
    code: "HRM-BON-008",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-incentive-payout.shared.ts (computeBonusAchievementPercent)",
      "packages/db/src/hr-bonus-incentive-achievements.ts (stored achievementPercent on record)",
      "packages/features/hr-suite/.../tests/bonus-payout-calculation.test.ts",
    ],
  },
  {
    code: "HRM-BON-009",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_payout_formulas, hr_bonus_payout_formula_kind enum)",
      "packages/db/src/hr-bonus-incentive-payout.shared.ts (computeBonusBasePayout)",
      "packages/db/src/hr-bonus-incentive-payout.ts (upsertHrBonusPayoutFormulaInTx)",
      "packages/features/hr-suite/.../schemas/hr.payroll.bonus-mutation.schema.ts",
    ],
  },
  {
    code: "HRM-BON-010",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_commission_tiers)",
      "packages/db/src/hr-bonus-incentive-payout.shared.ts (applyBonusCommissionTiers)",
      "packages/db/src/hr-bonus-incentive-payout.ts (replaceHrBonusCommissionTiersInTx)",
    ],
  },
  {
    code: "HRM-BON-011",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_accelerator_rules)",
      "packages/db/src/hr-bonus-incentive-payout.shared.ts (applyBonusAccelerator)",
      "packages/db/src/hr-bonus-incentive-payout.ts (upsertHrBonusAcceleratorRuleInTx)",
    ],
  },
  {
    code: "HRM-BON-019",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-eligibility.ts (validateHrBonusEligibilityBeforePayoutInTx)",
      "packages/db/src/hr-bonus-payouts.ts (prepareHrBonusPayoutInTx)",
      "packages/features/hr-suite/.../actions/hr.payroll.bonus-workflow.actions.server.ts",
    ],
  },
  {
    code: "HRM-BON-020",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-payout-validation.ts",
      "packages/db/src/hr-bonus-payout-validation.shared.ts",
      "packages/db/src/schema/hr-bonus.ts (validation_flags)",
    ],
  },
  {
    code: "HRM-BON-021",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-approval.ts (submitHrBonusPayoutForApprovalInTx)",
      "packages/features/hr-suite/.../actions/hr.payroll.bonus-workflow.actions.server.ts",
    ],
  },
  {
    code: "HRM-BON-022",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-approval.shared.ts (resolveHrBonusApprovalSteps)",
      "packages/db/src/schema/hr-bonus-incentive.ts (approval_routing_config)",
      "packages/db/src/schema/hr-bonus.ts (hr_bonus_payout_approval_steps)",
    ],
  },
  {
    code: "HRM-BON-023",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-approval.ts (reviewHrBonusPayoutInTx)",
      "packages/features/hr-suite/.../policies/hr.payroll.bonus-access.policy.server.ts (requireHrBonusApprove)",
      "apps/erp/src/app/api/hr/bonus/payouts/review/route.ts",
    ],
  },
  {
    code: "HRM-BON-024",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-approval.ts (requireDecisionReason)",
      "packages/features/hr-suite/.../schemas/hr.payroll.bonus-workflow.schema.ts",
      "packages/db/src/schema/hr-bonus.ts (rejection_reason, adjustment_reason, return_reason)",
    ],
  },
  {
    code: "HRM-BON-012",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (payout_floor, payout_cap on hr_bonus_payout_formulas)",
      "packages/db/src/hr-bonus-incentive-payout.shared.ts (enforceBonusPayoutBounds)",
      "packages/features/hr-suite/.../tests/bonus-payout-calculation.test.ts (cap/floor cases)",
    ],
  },
  {
    code: "HRM-BON-025",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-lock.ts (lockHrBonusPayoutAfterFinalApprovalInTx, assertHrBonusPayoutEditableInTx)",
      "packages/db/src/schema/hr-bonus.ts (locked_at, payout_status locked)",
    ],
  },
  {
    code: "HRM-BON-026",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/src/payroll-compensation/_integration/payroll-bonus-payouts.server.ts",
      "packages/db/src/hr-bonus-payroll.ts (listHrBonusPayrollPayoutRefs, markHrBonusPayrollPayoutRefsSyncedInTx)",
      "packages/db/src/schema/hr-bonus.ts (hr_bonus_payroll_payout_references)",
    ],
  },
  {
    code: "HRM-BON-027",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-accounting.ts (updateHrBonusPayoutAccountingAllocationInTx)",
      "packages/db/src/schema/hr-bonus.ts (accounting allocation columns on hr_bonus_payouts)",
      "packages/features/hr-suite/.../schemas/hr.payroll.bonus-accounting.schema.ts",
    ],
  },
  {
    code: "HRM-BON-028",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-reports.ts (buildHrBonusReportCsv)",
      "packages/db/src/hr-bonus-reports.shared.ts (bonus, commission, incentive, payout_variance, eligibility)",
    ],
  },
  {
    code: "HRM-BON-029",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../policies/hr.payroll.bonus-access.policy.server.ts",
      "packages/features/hr-suite/.../data/hr.payroll.bonus-sensitive-access.shared.ts",
      "packages/auth/src/index.ts (hr.bonus.* capabilities)",
    ],
  },
  {
    code: "HRM-BON-030",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-bonus-audit.ts (appendHrBonusPayoutAuditEventInTx)",
      "packages/db/src/schema/hr-bonus.ts (hr_bonus_payout_audit_events)",
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_audit_events for plan/target)",
      "packages/features/hr-suite/.../events/hr.payroll.bonus.event.ts",
    ],
  },
];

export const BONUS_ACCEPTANCE_CRITERIA_COVERAGE = [
  { criterion: 1, requirement: "HRM-BON-001", status: "shipped" as const },
  { criterion: 2, requirement: "HRM-BON-003", status: "shipped" as const },
  { criterion: 3, requirement: "HRM-BON-004", status: "shipped" as const },
  { criterion: 4, requirement: "HRM-BON-004", status: "shipped" as const },
  { criterion: 5, requirement: "HRM-BON-005", status: "shipped" as const },
  { criterion: 6, requirement: "HRM-BON-006", status: "shipped" as const },
  {
    criterion: 7,
    requirement: "HRM-BON-007",
    status: "shipped" as const,
  },
  {
    criterion: 8,
    requirement: "HRM-BON-008",
    status: "shipped" as const,
  },
  {
    criterion: 9,
    requirement: "HRM-BON-009",
    status: "shipped" as const,
  },
  {
    criterion: 10,
    requirement: "HRM-BON-010",
    status: "shipped" as const,
  },
  {
    criterion: 11,
    requirement: "HRM-BON-011",
    status: "shipped" as const,
  },
  {
    criterion: 12,
    requirement: "HRM-BON-012",
    status: "shipped" as const,
  },
  {
    criterion: 15,
    requirement: "HRM-BON-020",
    status: "shipped" as const,
  },
  {
    criterion: 16,
    requirement: "HRM-BON-021",
    status: "shipped" as const,
  },
  {
    criterion: 17,
    requirement: "HRM-BON-023",
    status: "shipped" as const,
  },
  {
    criterion: 18,
    requirement: "HRM-BON-024",
    status: "shipped" as const,
  },
  {
    criterion: 19,
    requirement: "HRM-BON-025",
    status: "shipped" as const,
  },
  {
    criterion: 20,
    requirement: "HRM-BON-026",
    status: "shipped" as const,
  },
  {
    criterion: 21,
    requirement: "HRM-BON-027",
    status: "shipped" as const,
  },
  {
    criterion: 23,
    requirement: "HRM-BON-028",
    status: "shipped" as const,
  },
  {
    criterion: 24,
    requirement: "HRM-BON-029",
    status: "shipped" as const,
  },
  {
    criterion: 25,
    requirement: "HRM-BON-030",
    status: "shipped" as const,
  },
] as const;

/** HRM-BON-013 … HRM-BON-018 governed UI shipment matrix. */
export const BONUS_RULES_UI_COVERAGE: readonly BonusRequirementCoverage[] = [
  {
    code: "HRM-BON-013",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_guaranteed_rules)",
      "packages/db/src/hr-bonus-incentive-lists.ts (listHrBonusGuaranteedRulesWindow)",
      "packages/features/hr-suite/.../surface/hr.payroll.bonus-governed-lists.surface.ts",
      "packages/features/hr-suite/.../components/hr.payroll.bonus-section.component.server.tsx",
    ],
  },
  {
    code: "HRM-BON-014",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_performance_multipliers)",
      "packages/db/src/hr-bonus-incentive-lists.ts (listHrBonusPerformanceMultipliersWindow)",
      "packages/features/hr-suite/.../surface/hr.payroll.bonus-governed-lists.surface.ts (multipliers list)",
    ],
  },
  {
    code: "HRM-BON-015",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_prorations)",
      "packages/db/src/hr-bonus-incentive-lists.ts (listHrBonusProrationsWindow)",
      "packages/features/hr-suite/.../surface/hr.payroll.bonus-governed-lists.surface.ts (prorations list)",
    ],
  },
  {
    code: "HRM-BON-016",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_manual_adjustments, justification + approval_reference)",
      "packages/db/src/hr-bonus-incentive-lists.ts (listHrBonusManualAdjustmentsWindow)",
      "packages/features/hr-suite/.../surface/hr.payroll.bonus-governed-lists.surface.ts (manual adjustments list)",
    ],
  },
  {
    code: "HRM-BON-017",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_discretionary_recommendations)",
      "packages/db/src/hr-bonus-incentive-lists.ts (listHrBonusDiscretionaryRecommendationsWindow)",
      "packages/features/hr-suite/.../surface/hr.payroll.bonus-governed-lists.surface.ts (discretionary list)",
    ],
  },
  {
    code: "HRM-BON-018",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-bonus-incentive.ts (hr_bonus_recoveries, recovery_kind enum)",
      "packages/db/src/hr-bonus-incentive-lists.ts (listHrBonusRecoveriesWindow)",
      "packages/features/hr-suite/.../surface/hr.payroll.bonus-governed-lists.surface.ts (recoveries list)",
    ],
  },
];

export const BONUS_RULES_ACCEPTANCE_CRITERIA_COVERAGE = [
  { criterion: 13, requirement: "HRM-BON-015", status: "shipped" as const },
  { criterion: 14, requirement: "HRM-BON-016", status: "shipped" as const },
  { criterion: 22, requirement: "HRM-BON-018", status: "shipped" as const },
] as const;
