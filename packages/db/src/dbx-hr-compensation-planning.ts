import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, } from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrDepartments, hrEmployees } from "./dbx-hr";
import { organizations } from "./dbx-organizations";
const organizationReference = () => organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
});
export type HrCompensationApprovalRules = {
    readonly steps: readonly {
        readonly role: string;
        readonly order: number;
        readonly minAmount?: number | null;
        readonly maxAmount?: number | null;
        readonly minPercent?: number | null;
        readonly maxPercent?: number | null;
        readonly budgetImpactMin?: number | null;
        readonly budgetImpactMax?: number | null;
        readonly legalEntityCode?: string | null;
        readonly legalEntityCodes?: readonly string[] | null;
        readonly departmentId?: string | null;
        readonly departmentIds?: readonly string[] | null;
        readonly grade?: string | null;
        readonly grades?: readonly string[] | null;
        readonly managerEmployeeId?: string | null;
        readonly managerEmployeeIds?: readonly string[] | null;
    }[];
};
export type HrCompensationEligibilityRuleConfig = {
    readonly employmentTypes?: readonly string[];
    readonly employmentStatuses?: readonly string[];
    readonly minTenureDays?: number | null;
    readonly grades?: readonly string[];
    readonly levels?: readonly string[];
    readonly departmentIds?: readonly string[];
    readonly legalEntityCodes?: readonly string[];
    readonly minPerformanceRating?: number | null;
};
/** CPM-002 — compensation cycle types. */
export const hrCompensationCycleTypeEnum = pgEnum("hr_compensation_cycle_type", [
    "annual_review",
    "merit_review",
    "promotion_review",
    "market_adjustment",
    "equity_adjustment",
    "retention_adjustment",
]);
export const hrCompensationCycleStatusEnum = pgEnum("hr_compensation_cycle_status", ["draft", "planning", "in_review", "approved", "closed", "cancelled"]);
/** CPM-003 — budget pool scope dimensions. */
export const hrCompensationBudgetPoolScopeEnum = pgEnum("hr_compensation_budget_pool_scope", [
    "organization",
    "legal_entity",
    "department",
    "business_unit",
    "grade",
    "location",
    "manager_group",
]);
export const hrCompensationParticipantEligibilityEnum = pgEnum("hr_compensation_participant_eligibility", ["eligible", "ineligible", "exception"]);
/** CPM-008..012 — adjustment recommendation kinds. */
export const hrCompensationAdjustmentTypeEnum = pgEnum("hr_compensation_adjustment_type", [
    "merit",
    "promotion",
    "market",
    "equity",
    "retention",
    "special",
]);
export const hrCompensationRecommendationStatusEnum = pgEnum("hr_compensation_recommendation_status", [
    "draft",
    "submitted",
    "hr_review",
    "pending_approval",
    "approved",
    "rejected",
    "returned",
]);
export const hrCompensationScenarioStatusEnum = pgEnum("hr_compensation_scenario_status", ["draft", "active", "superseded", "archived"]);
export const hrCompensationPayrollSyncStatusEnum = pgEnum("hr_compensation_payroll_sync_status", ["pending", "synced", "failed"]);
/** CPM-001 — compensation planning cycles. */
export const hrCompensationCycles = pgTable("hr_compensation_cycles", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    cycleType: hrCompensationCycleTypeEnum("cycle_type").notNull(),
    cycleStatus: hrCompensationCycleStatusEnum("cycle_status")
        .notNull()
        .default("draft"),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    approvalRules: jsonb("approval_rules")
        .$type<HrCompensationApprovalRules>()
        .notNull()
        .default({ steps: [] }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_compensation_cycles_org_code_uidx").on(table.organizationId, table.code),
    index("hr_compensation_cycles_org_status_idx").on(table.organizationId, table.cycleStatus),
]);
/** CPM-003 — budget pools scoped to cycle. */
export const hrCompensationBudgetPools = pgTable("hr_compensation_budget_pools", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrCompensationCycles.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    scope: hrCompensationBudgetPoolScopeEnum("scope").notNull(),
    scopeRef: text("scope_ref"),
    legalEntityCode: text("legal_entity_code"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    businessUnitCode: text("business_unit_code"),
    grade: text("grade"),
    locationCode: text("location_code"),
    managerEmployeeId: text("manager_employee_id").references(() => hrEmployees.id, { onDelete: "set null" }),
    allocatedAmount: numeric("allocated_amount", {
        precision: 14,
        scale: 2,
    }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_compensation_budget_pools_org_cycle_code_uidx").on(table.organizationId, table.cycleId, table.code),
    index("hr_compensation_budget_pools_org_scope_idx").on(table.organizationId, table.scope, table.scopeRef),
]);
/** CPM-005 — eligibility rules per cycle. */
export const hrCompensationEligibilityRules = pgTable("hr_compensation_eligibility_rules", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrCompensationCycles.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    ruleConfig: jsonb("rule_config")
        .$type<HrCompensationEligibilityRuleConfig>()
        .notNull(),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
}, (table) => [
    index("hr_compensation_eligibility_rules_org_cycle_idx").on(table.organizationId, table.cycleId),
]);
/** CPM-004/006 — cycle participants with compensation snapshot. */
export const hrCompensationCycleParticipants = pgTable("hr_compensation_cycle_participants", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrCompensationCycles.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    budgetPoolId: text("budget_pool_id").references(() => hrCompensationBudgetPools.id, { onDelete: "set null" }),
    eligibilityStatus: hrCompensationParticipantEligibilityEnum("eligibility_status")
        .notNull()
        .default("eligible"),
    eligibilityReason: text("eligibility_reason"),
    currentSalary: numeric("current_salary", { precision: 14, scale: 2 }),
    currentGrade: text("current_grade"),
    currentLevel: text("current_level"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    managerEmployeeId: text("manager_employee_id"),
    salaryEffectiveDate: timestamp("salary_effective_date", {
        withTimezone: true,
    }),
    performanceRating: numeric("performance_rating", { precision: 5, scale: 2 }),
    legalEntityCode: text("legal_entity_code"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_compensation_participants_org_cycle_employee_uidx").on(table.organizationId, table.cycleId, table.employeeId),
    index("hr_compensation_participants_org_eligibility_idx").on(table.organizationId, table.eligibilityStatus),
]);
/** CPM-007 — salary band reference by grade. */
export const hrCompensationSalaryBands = pgTable("hr_compensation_salary_bands", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    grade: text("grade").notNull(),
    legalEntityCode: text("legal_entity_code"),
    bandMinimum: numeric("band_minimum", { precision: 14, scale: 2 }).notNull(),
    bandMidpoint: numeric("band_midpoint", { precision: 14, scale: 2 }).notNull(),
    bandMaximum: numeric("band_maximum", { precision: 14, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_compensation_salary_bands_org_grade_entity_uidx").on(table.organizationId, table.grade, table.legalEntityCode),
]);
/** CPM-008..021 — compensation recommendations. */
export const hrCompensationRecommendations = pgTable("hr_compensation_recommendations", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrCompensationCycles.id, { onDelete: "cascade" }),
    participantId: text("participant_id")
        .notNull()
        .references(() => hrCompensationCycleParticipants.id, {
        onDelete: "cascade",
    }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    budgetPoolId: text("budget_pool_id").references(() => hrCompensationBudgetPools.id, { onDelete: "set null" }),
    adjustmentType: hrCompensationAdjustmentTypeEnum("adjustment_type").notNull(),
    recommendationStatus: hrCompensationRecommendationStatusEnum("recommendation_status")
        .notNull()
        .default("draft"),
    currentSalary: numeric("current_salary", { precision: 14, scale: 2 }).notNull(),
    increaseAmount: numeric("increase_amount", { precision: 14, scale: 2 }),
    increasePercent: numeric("increase_percent", { precision: 8, scale: 4 }),
    proposedSalary: numeric("proposed_salary", { precision: 14, scale: 2 }).notNull(),
    totalCompImpact: numeric("total_comp_impact", { precision: 14, scale: 2 }),
    bandMinimum: numeric("band_minimum", { precision: 14, scale: 2 }),
    bandMidpoint: numeric("band_midpoint", { precision: 14, scale: 2 }),
    bandMaximum: numeric("band_maximum", { precision: 14, scale: 2 }),
    rangePosition: numeric("range_position", { precision: 8, scale: 4 }),
    compaRatio: numeric("compa_ratio", { precision: 8, scale: 4 }),
    bandFlag: text("band_flag"),
    budgetImpact: numeric("budget_impact", { precision: 14, scale: 2 }),
    overBudget: boolean("over_budget").notNull().default(false),
    exceptionFlags: jsonb("exception_flags").$type<readonly string[]>(),
    justification: text("justification"),
    managerComments: text("manager_comments"),
    recommenderUserId: text("recommender_user_id"),
    reviewerUserId: text("reviewer_user_id"),
    approverUserId: text("approver_user_id"),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    effectiveDate: timestamp("effective_date", { withTimezone: true }),
    currencyCode: text("currency_code").notNull().default("USD"),
    ...timestampColumns,
}, (table) => [
    index("hr_compensation_recommendations_org_cycle_status_idx").on(table.organizationId, table.cycleId, table.recommendationStatus),
    index("hr_compensation_recommendations_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** CPM-015 — what-if scenarios. */
export const hrCompensationScenarios = pgTable("hr_compensation_scenarios", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrCompensationCycles.id, { onDelete: "cascade" }),
    recommendationId: text("recommendation_id").references(() => hrCompensationRecommendations.id, { onDelete: "set null" }),
    participantId: text("participant_id")
        .notNull()
        .references(() => hrCompensationCycleParticipants.id, {
        onDelete: "cascade",
    }),
    label: text("label").notNull(),
    scenarioStatus: hrCompensationScenarioStatusEnum("scenario_status")
        .notNull()
        .default("draft"),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    createdByUserId: text("created_by_user_id").notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_compensation_scenarios_org_cycle_idx").on(table.organizationId, table.cycleId),
]);
/** CPM-023/024 — approval workflow steps. */
export const hrCompensationApprovalSteps = pgTable("hr_compensation_approval_steps", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recommendationId: text("recommendation_id")
        .notNull()
        .references(() => hrCompensationRecommendations.id, {
        onDelete: "cascade",
    }),
    stepOrder: integer("step_order").notNull(),
    approverRole: text("approver_role").notNull(),
    approverUserId: text("approver_user_id"),
    stepStatus: text("step_status").notNull().default("pending"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    decisionNotes: text("decision_notes"),
    ...timestampColumns,
}, (table) => [
    index("hr_compensation_approval_steps_org_recommendation_idx").on(table.organizationId, table.recommendationId, table.stepOrder),
]);
/** CPM-026/028 — approved salary change records. */
export const hrCompensationSalaryChanges = pgTable("hr_compensation_salary_changes", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrCompensationCycles.id, { onDelete: "cascade" }),
    recommendationId: text("recommendation_id")
        .notNull()
        .references(() => hrCompensationRecommendations.id, {
        onDelete: "cascade",
    }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    previousSalary: numeric("previous_salary", { precision: 14, scale: 2 }).notNull(),
    newSalary: numeric("new_salary", { precision: 14, scale: 2 }).notNull(),
    adjustmentType: hrCompensationAdjustmentTypeEnum("adjustment_type").notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    employeeHistoryEventId: text("employee_history_event_id"),
    currencyCode: text("currency_code").notNull().default("USD"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_compensation_salary_changes_org_recommendation_uidx").on(table.organizationId, table.recommendationId),
    index("hr_compensation_salary_changes_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** CPM-027 — payroll processing handoff refs. */
export const hrCompensationPayrollRefs = pgTable("hr_compensation_payroll_refs", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    salaryChangeId: text("salary_change_id")
        .notNull()
        .references(() => hrCompensationSalaryChanges.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    syncStatus: hrCompensationPayrollSyncStatusEnum("sync_status")
        .notNull()
        .default("pending"),
    payrollReferenceCode: text("payroll_reference_code").notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    amountDelta: numeric("amount_delta", { precision: 14, scale: 2 }).notNull(),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_compensation_payroll_refs_org_salary_change_uidx").on(table.organizationId, table.salaryChangeId),
    index("hr_compensation_payroll_refs_org_sync_status_idx").on(table.organizationId, table.syncStatus),
]);
/** CPM-030 — audit trail. */
export const hrCompensationAuditEvents = pgTable("hr_compensation_audit_events", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id").references(() => hrCompensationCycles.id, {
        onDelete: "set null",
    }),
    recommendationId: text("recommendation_id").references(() => hrCompensationRecommendations.id, { onDelete: "set null" }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "set null",
    }),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_compensation_audit_events_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("hr_compensation_audit_events_org_cycle_idx").on(table.organizationId, table.cycleId),
]);

