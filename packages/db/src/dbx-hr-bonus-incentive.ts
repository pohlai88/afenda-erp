import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, } from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrDepartments, hrEmployees } from "./dbx-hr";
import { organizations } from "./dbx-organizations";
const organizationReference = () => organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
});
/** BON-002 plan types (minimal stub for BON-007–012 slice). */
export const hrBonusPlanTypeEnum = pgEnum("hr_bonus_plan_type", [
    "annual_bonus",
    "performance_bonus",
    "discretionary_bonus",
    "contractual_bonus",
    "sales_commission",
    "project_incentive",
    "productivity_incentive",
    "retention_incentive",
    "referral_incentive",
]);
export const hrBonusPlanStatusEnum = pgEnum("hr_bonus_plan_status", [
    "draft",
    "active",
    "archived",
]);
/** BON-006 target kinds (minimal stub). */
export const hrBonusTargetKindEnum = pgEnum("hr_bonus_target_kind", [
    "individual",
    "team",
    "department",
    "company",
    "sales",
    "revenue",
    "profit",
    "project",
    "kpi",
]);
/** BON-009 payout formula kinds. */
export const hrBonusPayoutFormulaKindEnum = pgEnum("hr_bonus_payout_formula_kind", [
    "fixed_amount",
    "salary_percentage",
    "sales_percentage",
    "revenue_percentage",
    "margin_percentage",
    "kpi_score",
    "performance_rating",
]);
/** BON-022 — approval routing step definition stored on plan. */
export type HrBonusApprovalRoutingStep = {
    role: string;
    order: number;
    minAmount?: number | null;
    maxAmount?: number | null;
    planTypes?: readonly string[] | null;
    legalEntityCodes?: readonly string[] | null;
    departmentIds?: readonly string[] | null;
    grades?: readonly string[] | null;
    budgetImpactMin?: number | null;
};
export type HrBonusApprovalRoutingConfig = {
    steps: readonly HrBonusApprovalRoutingStep[];
};
/** BON-005 — bonus and incentive cycle lifecycle. */
export const hrBonusCycleStatusEnum = pgEnum("hr_bonus_cycle_status", [
    "draft",
    "open",
    "closed",
]);
/** BON-004 — plan participant assignment status. */
export const hrBonusPlanParticipantStatusEnum = pgEnum("hr_bonus_plan_participant_status", ["assigned", "excluded", "pending_review"]);
/** BON-001 — bonus and incentive plan catalog. */
export const hrBonusPlans = pgTable("hr_bonus_plans", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    planType: hrBonusPlanTypeEnum("plan_type").notNull(),
    planStatus: hrBonusPlanStatusEnum("plan_status")
        .notNull()
        .default("draft"),
    currencyCode: text("currency_code").notNull().default("USD"),
    requiresApproval: boolean("requires_approval").notNull().default(true),
    /** BON-022 — staged approval routing by amount, plan type, and org attributes. */
    approvalRoutingConfig: jsonb("approval_routing_config").$type<HrBonusApprovalRoutingConfig | null>(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_bonus_plans_org_code_uidx").on(table.organizationId, table.code),
    index("hr_bonus_plans_org_status_idx").on(table.organizationId, table.planStatus),
    index("hr_bonus_plans_org_effective_idx").on(table.organizationId, table.effectiveFrom, table.effectiveTo),
]);
/** BON-003 — eligibility rules scoped to a bonus or incentive plan. */
export const hrBonusEligibilityRules = pgTable("hr_bonus_eligibility_rules", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    legalEntityCode: text("legal_entity_code"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    grade: text("grade"),
    jobRole: text("job_role"),
    employmentType: text("employment_type"),
    minTenureMonths: integer("min_tenure_months"),
    maxTenureMonths: integer("max_tenure_months"),
    performanceRating: text("performance_rating"),
    salesTeamCode: text("sales_team_code"),
    employeeStatus: text("employee_status"),
    active: boolean("active").notNull().default(true),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_eligibility_rules_org_plan_idx").on(table.organizationId, table.planId, table.active),
    index("hr_bonus_eligibility_rules_org_scope_idx").on(table.organizationId, table.legalEntityCode, table.departmentId, table.employmentType),
]);
/** BON-004 — eligible employee assignment to a bonus or incentive plan. */
export const hrBonusPlanParticipants = pgTable("hr_bonus_plan_participants", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    assignmentStatus: hrBonusPlanParticipantStatusEnum("assignment_status")
        .notNull()
        .default("assigned"),
    eligible: boolean("eligible").notNull().default(true),
    ineligibilityReason: text("ineligibility_reason"),
    assignedByUserId: text("assigned_by_user_id").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_bonus_plan_participants_org_plan_employee_uidx").on(table.organizationId, table.planId, table.employeeId),
    index("hr_bonus_plan_participants_org_plan_idx").on(table.organizationId, table.planId),
    index("hr_bonus_plan_participants_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** BON-005 — bonus and incentive cycle windows. */
export const hrBonusCycles = pgTable("hr_bonus_cycles", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    cycleStatus: hrBonusCycleStatusEnum("cycle_status")
        .notNull()
        .default("draft"),
    periodStartAt: timestamp("period_start_at", { withTimezone: true }).notNull(),
    periodEndAt: timestamp("period_end_at", { withTimezone: true }).notNull(),
    cutoffAt: timestamp("cutoff_at", { withTimezone: true }),
    approvalAt: timestamp("approval_at", { withTimezone: true }),
    payoutAt: timestamp("payout_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_bonus_cycles_org_plan_code_uidx").on(table.organizationId, table.planId, table.code),
    index("hr_bonus_cycles_org_plan_idx").on(table.organizationId, table.planId),
    index("hr_bonus_cycles_org_status_idx").on(table.organizationId, table.cycleStatus),
]);
/** BON-006 — individual, team, department, company, and KPI targets. */
export const hrBonusTargets = pgTable("hr_bonus_targets", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrBonusCycles.id, { onDelete: "cascade" }),
    targetKind: hrBonusTargetKindEnum("target_kind").notNull(),
    /** Stable scope key for uniqueness (employee, department, team, project, or global). */
    scopeKey: text("scope_key").notNull(),
    label: text("label"),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "cascade",
    }),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    teamRef: text("team_ref"),
    projectRef: text("project_ref"),
    targetValue: numeric("target_value", { precision: 16, scale: 4 }).notNull(),
    currencyCode: text("currency_code"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_bonus_targets_org_cycle_kind_scope_uidx").on(table.organizationId, table.cycleId, table.targetKind, table.scopeKey),
    index("hr_bonus_targets_org_plan_idx").on(table.organizationId, table.planId),
    index("hr_bonus_targets_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** BON-007 — actual achievement against a defined target. */
export const hrBonusTargetAchievements = pgTable("hr_bonus_target_achievements", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    targetId: text("target_id")
        .notNull()
        .references(() => hrBonusTargets.id, { onDelete: "cascade" }),
    actualValue: numeric("actual_value", { precision: 16, scale: 4 }).notNull(),
    /** BON-008 — computed and stored on record/update. */
    achievementPercent: numeric("achievement_percent", {
        precision: 8,
        scale: 4,
    }),
    recordedByUserId: text("recorded_by_user_id").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_bonus_target_achievements_org_target_uidx").on(table.organizationId, table.targetId),
    index("hr_bonus_target_achievements_org_recorded_idx").on(table.organizationId, table.recordedAt),
]);
/** BON-009 + BON-012 cap/floor on payout formula. */
export const hrBonusPayoutFormulas = pgTable("hr_bonus_payout_formulas", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    formulaKind: hrBonusPayoutFormulaKindEnum("formula_kind").notNull(),
    fixedAmount: numeric("fixed_amount", { precision: 14, scale: 2 }),
    percentageRate: numeric("percentage_rate", { precision: 8, scale: 4 }),
    performanceRatingWeight: numeric("performance_rating_weight", {
        precision: 14,
        scale: 4,
    }),
    /** BON-012 payout floor. */
    payoutFloor: numeric("payout_floor", { precision: 14, scale: 2 }),
    /** BON-012 payout cap. */
    payoutCap: numeric("payout_cap", { precision: 14, scale: 2 }),
    currencyCode: text("currency_code"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_bonus_payout_formulas_org_plan_uidx").on(table.organizationId, table.planId),
]);
/** BON-010 tiered commission rates. */
export const hrBonusCommissionTiers = pgTable("hr_bonus_commission_tiers", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    tierOrder: integer("tier_order").notNull().default(0),
    minThreshold: numeric("min_threshold", { precision: 16, scale: 4 }).notNull(),
    maxThreshold: numeric("max_threshold", { precision: 16, scale: 4 }),
    ratePercent: numeric("rate_percent", { precision: 8, scale: 4 }).notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_commission_tiers_org_plan_order_idx").on(table.organizationId, table.planId, table.tierOrder),
]);
/** BON-011 accelerator rates for overachievement. */
export const hrBonusAcceleratorRules = pgTable("hr_bonus_accelerator_rules", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    thresholdPercent: numeric("threshold_percent", {
        precision: 8,
        scale: 4,
    })
        .notNull()
        .default("100"),
    acceleratorRate: numeric("accelerator_rate", {
        precision: 8,
        scale: 4,
    }).notNull(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_bonus_accelerator_rules_org_plan_uidx").on(table.organizationId, table.planId),
]);
/** Audit events for achievement and payout calculation actions. */
export const hrBonusAuditEvents = pgTable("hr_bonus_audit_events", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id").references(() => hrBonusPlans.id, {
        onDelete: "set null",
    }),
    targetId: text("target_id").references(() => hrBonusTargets.id, {
        onDelete: "set null",
    }),
    achievementId: text("achievement_id").references(() => hrBonusTargetAchievements.id, { onDelete: "set null" }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "set null",
    }),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary"),
    metadata: text("metadata"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_audit_events_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("hr_bonus_audit_events_org_plan_idx").on(table.organizationId, table.planId),
]);
/** BON-014 — performance multiplier scope. */
export const hrBonusMultiplierScopeEnum = pgEnum("hr_bonus_multiplier_scope", [
    "company",
    "department",
    "team",
    "individual",
]);
/** BON-015 — proration reason. */
export const hrBonusProrationReasonEnum = pgEnum("hr_bonus_proration_reason", [
    "new_joiner",
    "resignation",
    "unpaid_leave",
    "partial_period",
]);
/** BON-018 — recovery / clawback kind. */
export const hrBonusRecoveryKindEnum = pgEnum("hr_bonus_recovery_kind", [
    "commission_reversal",
    "payout_correction",
    "overpayment_recovery",
    "clawback",
]);
/** BON-017 — discretionary recommendation status. */
export const hrBonusRecommendationStatusEnum = pgEnum("hr_bonus_recommendation_status", ["draft", "submitted", "approved", "rejected"]);
/** BON-013 — guaranteed bonus rules per plan. */
export const hrBonusGuaranteedRules = pgTable("hr_bonus_guaranteed_rules", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    minimumAmount: numeric("minimum_amount", {
        precision: 14,
        scale: 2,
    }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    active: boolean("active").notNull().default(true),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_guaranteed_rules_org_plan_idx").on(table.organizationId, table.planId),
    index("hr_bonus_guaranteed_rules_org_active_idx").on(table.organizationId, table.active),
]);
/** BON-014 — company, department, team, and individual performance multipliers. */
export const hrBonusPerformanceMultipliers = pgTable("hr_bonus_performance_multipliers", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    scope: hrBonusMultiplierScopeEnum("scope").notNull(),
    scopeRef: text("scope_ref"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    multiplier: numeric("multiplier", { precision: 8, scale: 4 }).notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_multipliers_org_plan_scope_idx").on(table.organizationId, table.planId, table.scope),
]);
/** BON-015 — bonus proration records. */
export const hrBonusProrations = pgTable("hr_bonus_prorations", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrBonusCycles.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    reason: hrBonusProrationReasonEnum("reason").notNull(),
    prorationFactor: numeric("proration_factor", {
        precision: 8,
        scale: 4,
    }).notNull(),
    periodStartAt: timestamp("period_start_at", { withTimezone: true }),
    periodEndAt: timestamp("period_end_at", { withTimezone: true }),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_prorations_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_bonus_prorations_org_plan_cycle_idx").on(table.organizationId, table.planId, table.cycleId),
]);
/** BON-016 — manual payout adjustment with justification and approval reference. */
export const hrBonusManualAdjustments = pgTable("hr_bonus_manual_adjustments", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id").references(() => hrBonusCycles.id, {
        onDelete: "set null",
    }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    adjustmentAmount: numeric("adjustment_amount", {
        precision: 14,
        scale: 2,
    }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    justification: text("justification").notNull(),
    approvalReference: text("approval_reference").notNull(),
    status: text("status").notNull().default("pending"),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_manual_adjustments_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_bonus_manual_adjustments_org_status_idx").on(table.organizationId, table.status),
]);
/** BON-017 — discretionary bonus recommendations. */
export const hrBonusDiscretionaryRecommendations = pgTable("hr_bonus_discretionary_recommendations", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id").references(() => hrBonusPlans.id, {
        onDelete: "set null",
    }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    recommendedAmount: numeric("recommended_amount", {
        precision: 14,
        scale: 2,
    }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    recommendationStatus: hrBonusRecommendationStatusEnum("recommendation_status")
        .notNull()
        .default("draft"),
    recommenderUserId: text("recommender_user_id").notNull(),
    rationale: text("rationale"),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_recommendations_org_status_idx").on(table.organizationId, table.recommendationStatus),
    index("hr_bonus_recommendations_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** BON-018 — commission reversal, correction, recovery, and clawback references. */
export const hrBonusRecoveries = pgTable("hr_bonus_recoveries", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id").references(() => hrBonusPlans.id, {
        onDelete: "set null",
    }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    recoveryKind: hrBonusRecoveryKindEnum("recovery_kind").notNull(),
    recoveryAmount: numeric("recovery_amount", {
        precision: 14,
        scale: 2,
    }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    referenceCode: text("reference_code").notNull(),
    clawbackReference: text("clawback_reference"),
    notes: text("notes"),
    recordedByUserId: text("recorded_by_user_id").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_recoveries_org_kind_idx").on(table.organizationId, table.recoveryKind),
    index("hr_bonus_recoveries_org_employee_idx").on(table.organizationId, table.employeeId),
]);

