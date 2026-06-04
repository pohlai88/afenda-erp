import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, } from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrDepartments, hrEmployees } from "./dbx-hr";
import { organizations } from "./dbx-organizations";
import { hrBonusCycles, hrBonusPlanTypeEnum, hrBonusPlans, } from "./dbx-hr-bonus-incentive";
const organizationReference = () => organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
});
export const hrBonusPayoutStatusEnum = pgEnum("hr_bonus_payout_status", [
    "draft",
    "pending_approval",
    "approved",
    "locked",
    "rejected",
    "returned",
]);
export const hrBonusPayouts = pgTable("hr_bonus_payouts", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBonusPlans.id, { onDelete: "restrict" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrBonusCycles.id, { onDelete: "restrict" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "restrict" }),
    planType: hrBonusPlanTypeEnum("plan_type").notNull(),
    payoutStatus: hrBonusPayoutStatusEnum("payout_status")
        .notNull()
        .default("draft"),
    calculatedAmount: numeric("calculated_amount", {
        precision: 14,
        scale: 2,
    }),
    adjustedAmount: numeric("adjusted_amount", { precision: 14, scale: 2 }),
    finalAmount: numeric("final_amount", { precision: 14, scale: 2 }),
    targetAmount: numeric("target_amount", { precision: 14, scale: 2 }),
    varianceAmount: numeric("variance_amount", { precision: 14, scale: 2 }),
    currencyCode: text("currency_code").notNull().default("USD"),
    eligible: boolean("eligible").notNull().default(true),
    eligibilityNotes: text("eligibility_notes"),
    /** BON-020 — missing target, achievement, rating, or formula flags. */
    validationFlags: jsonb("validation_flags").$type<readonly string[]>(),
    performanceRating: numeric("performance_rating", {
        precision: 8,
        scale: 4,
    }),
    adjustmentReason: text("adjustment_reason"),
    rejectionReason: text("rejection_reason"),
    returnReason: text("return_reason"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedByUserId: text("approved_by_user_id"),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lockedByUserId: text("locked_by_user_id"),
    legalEntityCode: text("legal_entity_code"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    costCenterCode: text("cost_center_code"),
    projectCode: text("project_code"),
    salesRegionCode: text("sales_region_code"),
    glReference: text("gl_reference"),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_payouts_org_status_idx").on(table.organizationId, table.payoutStatus),
    index("hr_bonus_payouts_org_plan_cycle_idx").on(table.organizationId, table.planId, table.cycleId),
    index("hr_bonus_payouts_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_bonus_payouts_org_locked_idx").on(table.organizationId, table.lockedAt),
]);
/** BON-021..022 — staged approval routing for a payout. */
export const hrBonusPayoutApprovalSteps = pgTable("hr_bonus_payout_approval_steps", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    payoutId: text("payout_id")
        .notNull()
        .references(() => hrBonusPayouts.id, { onDelete: "cascade" }),
    stepOrder: integer("step_order").notNull(),
    approverRole: text("approver_role").notNull(),
    approverUserId: text("approver_user_id"),
    stepStatus: text("step_status").notNull().default("pending"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    decisionNotes: text("decision_notes"),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_payout_approval_steps_org_payout_idx").on(table.organizationId, table.payoutId, table.stepOrder),
]);
export const hrBonusPayrollPayoutReferences = pgTable("hr_bonus_payroll_payout_references", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    payoutId: text("payout_id")
        .notNull()
        .references(() => hrBonusPayouts.id, { onDelete: "cascade" }),
    payrollPayoutReference: text("payroll_payout_reference").notNull(),
    earningsCode: text("earnings_code").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    active: boolean("active").notNull().default(true),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_bonus_payroll_refs_org_payroll_ref_uidx").on(table.organizationId, table.payrollPayoutReference),
    index("hr_bonus_payroll_refs_org_payout_idx").on(table.organizationId, table.payoutId),
    index("hr_bonus_payroll_refs_org_active_idx").on(table.organizationId, table.active),
]);
/** Payout workflow audit (distinct from calculation audit in hr-bonus-incentive). */
export const hrBonusPayoutAuditEvents = pgTable("hr_bonus_payout_audit_events", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    payoutId: text("payout_id").references(() => hrBonusPayouts.id, {
        onDelete: "set null",
    }),
    planId: text("plan_id").references(() => hrBonusPlans.id, {
        onDelete: "set null",
    }),
    cycleId: text("cycle_id").references(() => hrBonusCycles.id, {
        onDelete: "set null",
    }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "set null",
    }),
    action: text("action").notNull(),
    actorUserId: text("actor_user_id"),
    summary: text("summary").notNull(),
    metadata: text("metadata"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_bonus_payout_audit_events_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("hr_bonus_payout_audit_events_org_payout_idx").on(table.organizationId, table.payoutId),
    index("hr_bonus_payout_audit_events_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_bonus_payout_audit_events_org_action_idx").on(table.organizationId, table.action),
]);

