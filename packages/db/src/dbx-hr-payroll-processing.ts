import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, } from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrEmployees } from "./dbx-hr";
import { organizations } from "./dbx-organizations";
const organizationReference = () => organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
});
export type HrPayrollApprovalRules = {
    readonly steps: readonly {
        readonly role: string;
        readonly order: number;
        readonly minAmount?: number | null;
        readonly maxAmount?: number | null;
        readonly payGroupId?: string | null;
        readonly legalEntityCode?: string | null;
    }[];
};
export type HrPayrollRunLineComponent = {
    readonly code: string;
    readonly label: string;
    readonly kind: "earning" | "deduction" | "tax" | "statutory_employee" | "statutory_employer" | "employer_cost";
    readonly category: string;
    readonly amount: string;
    readonly quantity?: string | null;
    readonly rate?: string | null;
    readonly sourceRef?: string | null;
    readonly taxable?: boolean | null;
    readonly contributable?: boolean | null;
};
export type HrPayrollRunLineSnapshot = {
    readonly components: readonly HrPayrollRunLineComponent[];
    readonly grossPay: string;
    readonly totalDeductions: string;
    readonly totalTax: string;
    readonly totalStatutoryEmployee: string;
    readonly totalStatutoryEmployer: string;
    readonly totalEmployerCost: string;
    readonly netPay: string;
    readonly currencyCode: string;
};
export type HrPayrollInputPayload = Record<string, unknown>;
export type HrPayrollPayslipLineItem = {
    readonly code: string;
    readonly label: string;
    readonly kind: string;
    readonly amount: string;
};
/** PAY-002 — pay schedule frequencies. */
export const hrPayrollPayScheduleEnum = pgEnum("hr_payroll_pay_schedule", [
    "monthly",
    "weekly",
    "bi_weekly",
    "semi_monthly",
    "ad_hoc",
]);
export const hrPayrollPayGroupStatusEnum = pgEnum("hr_payroll_pay_group_status", [
    "active",
    "inactive",
]);
/** PAY-001 — payroll cycle lifecycle. */
export const hrPayrollCycleStatusEnum = pgEnum("hr_payroll_cycle_status", [
    "draft",
    "open",
    "input_collection",
    "validation",
    "preview",
    "pending_approval",
    "approved",
    "locked",
    "closed",
    "cancelled",
]);
export const hrPayrollEmployeeAssignmentStatusEnum = pgEnum("hr_payroll_employee_assignment_status", ["active", "inactive", "pending"]);
/** PAY-004..011 — earning vs deduction component kind. */
export const hrPayrollComponentKindEnum = pgEnum("hr_payroll_component_kind", [
    "earning",
    "deduction",
]);
/** PAY-004..011 — payroll component categories. */
export const hrPayrollComponentCategoryEnum = pgEnum("hr_payroll_component_category", [
    "basic_salary",
    "hourly_wage",
    "daily_wage",
    "fixed_earning",
    "allowance_fixed",
    "allowance_variable",
    "overtime",
    "unpaid_leave",
    "absence",
    "lateness",
    "loan",
    "advance",
    "penalty",
    "tax_employee",
    "statutory_employee",
    "statutory_employer",
    "employer_cost",
    "recurring_earning",
    "recurring_deduction",
    "other",
]);
export const hrPayrollCalculationMethodEnum = pgEnum("hr_payroll_calculation_method", ["fixed_amount", "hourly_rate", "daily_rate", "percentage", "formula"]);
/** PAY-016 — staged input source modules. */
export const hrPayrollInputSourceEnum = pgEnum("hr_payroll_input_source", [
    "attendance",
    "leave",
    "claims",
    "benefits",
    "commissions",
    "employee_records",
    "manual",
]);
export const hrPayrollInputStatusEnum = pgEnum("hr_payroll_input_status", [
    "staged",
    "approved",
    "rejected",
    "consumed",
]);
/** PAY-012..015 — adjustment kinds. */
export const hrPayrollAdjustmentKindEnum = pgEnum("hr_payroll_adjustment_kind", [
    "one_time_earning",
    "one_time_deduction",
    "manual",
    "proration",
    "retro",
]);
export const hrPayrollAdjustmentStatusEnum = pgEnum("hr_payroll_adjustment_status", ["draft", "pending_approval", "approved", "rejected", "applied", "cancelled"]);
/** PAY-014 — proration scenario kinds. */
export const hrPayrollProrationScenarioEnum = pgEnum("hr_payroll_proration_scenario", [
    "new_joiner",
    "resignation",
    "unpaid_leave",
    "mid_period_salary_change",
    "other",
]);
/** PAY-021..023 — payroll run lifecycle. */
export const hrPayrollRunStatusEnum = pgEnum("hr_payroll_run_status", [
    "draft",
    "open",
    "input_collection",
    "validation",
    "preview",
    "pending_approval",
    "approved",
    "locked",
    "closed",
    "cancelled",
]);
export const hrPayrollRunKindEnum = pgEnum("hr_payroll_run_kind", [
    "preview",
    "final",
]);
/** PAY-017..020 — validation kinds and severity. */
export const hrPayrollValidationKindEnum = pgEnum("hr_payroll_validation_kind", [
    "missing_data",
    "negative_pay",
    "variance",
    "statutory_readiness",
    "blocking_error",
    "readiness",
]);
export const hrPayrollValidationSeverityEnum = pgEnum("hr_payroll_validation_severity", ["info", "warning", "error", "blocking"]);
export const hrPayrollApprovalStepStatusEnum = pgEnum("hr_payroll_approval_step_status", ["pending", "approved", "rejected", "returned"]);
/** PAY-024..025 — payslip lifecycle. */
export const hrPayrollPayslipStatusEnum = pgEnum("hr_payroll_payslip_status", [
    "draft",
    "finalized",
    "published",
    "revoked",
]);
/** PAY-026..027 — payment batch and payment status. */
export const hrPayrollPaymentBatchStatusEnum = pgEnum("hr_payroll_payment_batch_status", [
    "draft",
    "generated",
    "submitted",
    "processing",
    "completed",
    "failed",
    "cancelled",
]);
export const hrPayrollPaymentStatusEnum = pgEnum("hr_payroll_payment_status", [
    "pending",
    "processing",
    "paid",
    "failed",
    "reversed",
]);
/** PAY-029 — correction or reversal. */
export const hrPayrollCorrectionKindEnum = pgEnum("hr_payroll_correction_kind", [
    "correction",
    "reversal",
]);
export const hrPayrollCorrectionStatusEnum = pgEnum("hr_payroll_correction_status", [
    "draft",
    "pending_authorization",
    "authorized",
    "applied",
    "rejected",
    "cancelled",
]);
/** PAY-001/002/003 — pay group definition. */
export const hrPayrollPayGroups = pgTable("hr_payroll_pay_groups", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    paySchedule: hrPayrollPayScheduleEnum("pay_schedule").notNull(),
    payGroupStatus: hrPayrollPayGroupStatusEnum("pay_group_status")
        .notNull()
        .default("active"),
    currencyCode: text("currency_code").notNull().default("USD"),
    legalEntityCode: text("legal_entity_code"),
    approvalRules: jsonb("approval_rules")
        .$type<HrPayrollApprovalRules>()
        .notNull()
        .default({ steps: [] }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_payroll_pay_groups_org_code_uidx").on(table.organizationId, table.code),
    index("hr_payroll_pay_groups_org_status_idx").on(table.organizationId, table.payGroupStatus),
]);
/** PAY-001 — payroll cycle by pay group, period, cutoff, pay date. */
export const hrPayrollCycles = pgTable("hr_payroll_cycles", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    payGroupId: text("pay_group_id")
        .notNull()
        .references(() => hrPayrollPayGroups.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    cycleStatus: hrPayrollCycleStatusEnum("cycle_status")
        .notNull()
        .default("draft"),
    periodStartAt: timestamp("period_start_at", { withTimezone: true }).notNull(),
    periodEndAt: timestamp("period_end_at", { withTimezone: true }).notNull(),
    cutoffAt: timestamp("cutoff_at", { withTimezone: true }).notNull(),
    payDateAt: timestamp("pay_date_at", { withTimezone: true }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_payroll_cycles_org_pay_group_code_uidx").on(table.organizationId, table.payGroupId, table.code),
    index("hr_payroll_cycles_org_status_idx").on(table.organizationId, table.cycleStatus),
    index("hr_payroll_cycles_org_pay_date_idx").on(table.organizationId, table.payDateAt),
]);
/** PAY-003 — employee pay group assignments. */
export const hrPayrollEmployeeAssignments = pgTable("hr_payroll_employee_assignments", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    payGroupId: text("pay_group_id")
        .notNull()
        .references(() => hrPayrollPayGroups.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    assignmentStatus: hrPayrollEmployeeAssignmentStatusEnum("assignment_status")
        .notNull()
        .default("active"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    primaryAssignment: boolean("primary_assignment").notNull().default(true),
    assignedByUserId: text("assigned_by_user_id").notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_payroll_employee_assignments_org_employee_idx").on(table.organizationId, table.employeeId, table.assignmentStatus),
    index("hr_payroll_employee_assignments_org_pay_group_idx").on(table.organizationId, table.payGroupId),
    uniqueIndex("hr_payroll_employee_assignments_org_group_employee_from_uidx").on(table.organizationId, table.payGroupId, table.employeeId, table.effectiveFrom),
]);
/** PAY-004..011 — recurring earning and deduction definitions. */
export const hrPayrollEarningDeductionDefinitions = pgTable("hr_payroll_earning_deduction_definitions", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    payGroupId: text("pay_group_id").references(() => hrPayrollPayGroups.id, {
        onDelete: "set null",
    }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "cascade",
    }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    componentKind: hrPayrollComponentKindEnum("component_kind").notNull(),
    componentCategory: hrPayrollComponentCategoryEnum("component_category").notNull(),
    calculationMethod: hrPayrollCalculationMethodEnum("calculation_method")
        .notNull()
        .default("fixed_amount"),
    defaultAmount: numeric("default_amount", { precision: 14, scale: 2 }),
    defaultRate: numeric("default_rate", { precision: 10, scale: 4 }),
    isRecurring: boolean("is_recurring").notNull().default(true),
    taxable: boolean("taxable").notNull().default(true),
    contributable: boolean("contributable").notNull().default(true),
    active: boolean("active").notNull().default(true),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    currencyCode: text("currency_code").notNull().default("USD"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_payroll_ed_definitions_org_code_uidx").on(table.organizationId, table.code, table.employeeId),
    index("hr_payroll_ed_definitions_org_employee_idx").on(table.organizationId, table.employeeId, table.active),
    index("hr_payroll_ed_definitions_org_pay_group_idx").on(table.organizationId, table.payGroupId),
]);
/** PAY-016 — staged payroll inputs from other modules. */
export const hrPayrollCycleInputs = pgTable("hr_payroll_cycle_inputs", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    inputSource: hrPayrollInputSourceEnum("input_source").notNull(),
    inputStatus: hrPayrollInputStatusEnum("input_status")
        .notNull()
        .default("staged"),
    externalRef: text("external_ref"),
    componentCategory: hrPayrollComponentCategoryEnum("component_category"),
    quantity: numeric("quantity", { precision: 12, scale: 4 }),
    amount: numeric("amount", { precision: 14, scale: 2 }),
    currencyCode: text("currency_code").notNull().default("USD"),
    payload: jsonb("payload").$type<HrPayrollInputPayload>(),
    approvedByUserId: text("approved_by_user_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    consumedRunId: text("consumed_run_id"),
    ...timestampColumns,
}, (table) => [
    index("hr_payroll_cycle_inputs_org_cycle_idx").on(table.organizationId, table.cycleId, table.inputStatus),
    index("hr_payroll_cycle_inputs_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_payroll_cycle_inputs_org_source_ref_idx").on(table.organizationId, table.inputSource, table.externalRef),
]);
/** PAY-012..015 — one-time, manual, proration, and retro adjustments. */
export const hrPayrollAdjustments = pgTable("hr_payroll_adjustments", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    adjustmentKind: hrPayrollAdjustmentKindEnum("adjustment_kind").notNull(),
    adjustmentStatus: hrPayrollAdjustmentStatusEnum("adjustment_status")
        .notNull()
        .default("draft"),
    componentKind: hrPayrollComponentKindEnum("component_kind").notNull(),
    componentCategory: hrPayrollComponentCategoryEnum("component_category").notNull(),
    prorationScenario: hrPayrollProrationScenarioEnum("proration_scenario"),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    reason: text("reason").notNull(),
    approvalReference: text("approval_reference"),
    retroEffectiveFrom: timestamp("retro_effective_from", { withTimezone: true }),
    retroEffectiveTo: timestamp("retro_effective_to", { withTimezone: true }),
    appliedRunId: text("applied_run_id"),
    createdByUserId: text("created_by_user_id").notNull(),
    approvedByUserId: text("approved_by_user_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_payroll_adjustments_org_cycle_idx").on(table.organizationId, table.cycleId, table.adjustmentStatus),
    index("hr_payroll_adjustments_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** PAY-017..023 — payroll calculation runs. */
export const hrPayrollRuns = pgTable("hr_payroll_runs", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    runKind: hrPayrollRunKindEnum("run_kind").notNull().default("preview"),
    runStatus: hrPayrollRunStatusEnum("run_status").notNull().default("draft"),
    runNumber: integer("run_number").notNull().default(1),
    employeeCount: integer("employee_count").notNull().default(0),
    totalGrossPay: numeric("total_gross_pay", { precision: 16, scale: 2 })
        .notNull()
        .default("0"),
    totalNetPay: numeric("total_net_pay", { precision: 16, scale: 2 })
        .notNull()
        .default("0"),
    totalEmployerCost: numeric("total_employer_cost", { precision: 16, scale: 2 })
        .notNull()
        .default("0"),
    currencyCode: text("currency_code").notNull().default("USD"),
    blockingErrorCount: integer("blocking_error_count").notNull().default(0),
    validationPassed: boolean("validation_passed").notNull().default(false),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    createdByUserId: text("created_by_user_id").notNull(),
    approvedByUserId: text("approved_by_user_id"),
    ...timestampColumns,
}, (table) => [
    index("hr_payroll_runs_org_cycle_idx").on(table.organizationId, table.cycleId, table.runStatus),
    uniqueIndex("hr_payroll_runs_org_cycle_number_uidx").on(table.organizationId, table.cycleId, table.runNumber),
]);
/** PAY-004..011, 021 — per-employee payroll run lines. */
export const hrPayrollRunLines = pgTable("hr_payroll_run_lines", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    runId: text("run_id")
        .notNull()
        .references(() => hrPayrollRuns.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    grossPay: numeric("gross_pay", { precision: 14, scale: 2 }).notNull(),
    totalDeductions: numeric("total_deductions", { precision: 14, scale: 2 })
        .notNull()
        .default("0"),
    totalTax: numeric("total_tax", { precision: 14, scale: 2 })
        .notNull()
        .default("0"),
    totalStatutoryEmployee: numeric("total_statutory_employee", {
        precision: 14,
        scale: 2,
    })
        .notNull()
        .default("0"),
    totalStatutoryEmployer: numeric("total_statutory_employer", {
        precision: 14,
        scale: 2,
    })
        .notNull()
        .default("0"),
    totalEmployerCost: numeric("total_employer_cost", { precision: 14, scale: 2 })
        .notNull()
        .default("0"),
    netPay: numeric("net_pay", { precision: 14, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    lineSnapshot: jsonb("line_snapshot")
        .$type<HrPayrollRunLineSnapshot>()
        .notNull(),
    previousNetPay: numeric("previous_net_pay", { precision: 14, scale: 2 }),
    variancePercent: numeric("variance_percent", { precision: 8, scale: 4 }),
    hasBlockingErrors: boolean("has_blocking_errors").notNull().default(false),
    missingDataFlags: jsonb("missing_data_flags").$type<readonly string[]>(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_payroll_run_lines_org_run_employee_uidx").on(table.organizationId, table.runId, table.employeeId),
    index("hr_payroll_run_lines_org_cycle_idx").on(table.organizationId, table.cycleId),
    index("hr_payroll_run_lines_org_employee_idx").on(table.organizationId, table.employeeId),
]);
/** PAY-017..020 — validation results per run. */
export const hrPayrollValidations = pgTable("hr_payroll_validations", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    runId: text("run_id")
        .notNull()
        .references(() => hrPayrollRuns.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "set null",
    }),
    validationKind: hrPayrollValidationKindEnum("validation_kind").notNull(),
    severity: hrPayrollValidationSeverityEnum("severity").notNull(),
    code: text("code").notNull(),
    message: text("message").notNull(),
    isBlocking: boolean("is_blocking").notNull().default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_payroll_validations_org_run_idx").on(table.organizationId, table.runId, table.isBlocking),
    index("hr_payroll_validations_org_cycle_idx").on(table.organizationId, table.cycleId),
]);
/** PAY-022 — payroll approval workflow steps. */
export const hrPayrollApprovals = pgTable("hr_payroll_approvals", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    runId: text("run_id")
        .notNull()
        .references(() => hrPayrollRuns.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    stepOrder: integer("step_order").notNull(),
    approverRole: text("approver_role").notNull(),
    approverUserId: text("approver_user_id"),
    stepStatus: hrPayrollApprovalStepStatusEnum("step_status")
        .notNull()
        .default("pending"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    decisionNotes: text("decision_notes"),
    ...timestampColumns,
}, (table) => [
    index("hr_payroll_approvals_org_run_idx").on(table.organizationId, table.runId, table.stepOrder),
]);
/** PAY-024..025 — employee payslips. */
export const hrPayrollPayslips = pgTable("hr_payroll_payslips", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    runId: text("run_id")
        .notNull()
        .references(() => hrPayrollRuns.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    runLineId: text("run_line_id")
        .notNull()
        .references(() => hrPayrollRunLines.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    payslipStatus: hrPayrollPayslipStatusEnum("payslip_status")
        .notNull()
        .default("draft"),
    payslipNumber: text("payslip_number").notNull(),
    grossPay: numeric("gross_pay", { precision: 14, scale: 2 }).notNull(),
    netPay: numeric("net_pay", { precision: 14, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    lineItems: jsonb("line_items").$type<readonly HrPayrollPayslipLineItem[]>(),
    essAccessible: boolean("ess_accessible").notNull().default(false),
    essPublishedAt: timestamp("ess_published_at", { withTimezone: true }),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_payroll_payslips_org_run_employee_uidx").on(table.organizationId, table.runId, table.employeeId),
    uniqueIndex("hr_payroll_payslips_org_number_uidx").on(table.organizationId, table.payslipNumber),
    index("hr_payroll_payslips_org_employee_ess_idx").on(table.organizationId, table.employeeId, table.essAccessible),
]);
/** PAY-026 — payment batches. */
export const hrPayrollPaymentBatches = pgTable("hr_payroll_payment_batches", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    runId: text("run_id")
        .notNull()
        .references(() => hrPayrollRuns.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    batchNumber: text("batch_number").notNull(),
    batchStatus: hrPayrollPaymentBatchStatusEnum("batch_status")
        .notNull()
        .default("draft"),
    paymentCount: integer("payment_count").notNull().default(0),
    totalAmount: numeric("total_amount", { precision: 16, scale: 2 })
        .notNull()
        .default("0"),
    currencyCode: text("currency_code").notNull().default("USD"),
    bankFileReference: text("bank_file_reference"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdByUserId: text("created_by_user_id").notNull(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_payroll_payment_batches_org_number_uidx").on(table.organizationId, table.batchNumber),
    index("hr_payroll_payment_batches_org_run_idx").on(table.organizationId, table.runId),
]);
/** PAY-027 — individual payroll payments. */
export const hrPayrollPayments = pgTable("hr_payroll_payments", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    batchId: text("batch_id")
        .notNull()
        .references(() => hrPayrollPaymentBatches.id, { onDelete: "cascade" }),
    runId: text("run_id")
        .notNull()
        .references(() => hrPayrollRuns.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    payslipId: text("payslip_id").references(() => hrPayrollPayslips.id, {
        onDelete: "set null",
    }),
    paymentStatus: hrPayrollPaymentStatusEnum("payment_status")
        .notNull()
        .default("pending"),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    bankAccountRef: text("bank_account_ref"),
    paymentReference: text("payment_reference"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    ...timestampColumns,
}, (table) => [
    index("hr_payroll_payments_org_batch_idx").on(table.organizationId, table.batchId),
    index("hr_payroll_payments_org_employee_status_idx").on(table.organizationId, table.employeeId, table.paymentStatus),
]);
/** PAY-028 — finance journal posting references. */
export const hrPayrollJournalRefs = pgTable("hr_payroll_journal_refs", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    runId: text("run_id")
        .notNull()
        .references(() => hrPayrollRuns.id, { onDelete: "cascade" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    journalReference: text("journal_reference").notNull(),
    costCenterCode: text("cost_center_code"),
    legalEntityCode: text("legal_entity_code"),
    totalDebit: numeric("total_debit", { precision: 16, scale: 2 }).notNull(),
    totalCredit: numeric("total_credit", { precision: 16, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_payroll_journal_refs_org_run_uidx").on(table.organizationId, table.runId),
    index("hr_payroll_journal_refs_org_journal_ref_idx").on(table.organizationId, table.journalReference),
]);
/** PAY-029 — payroll corrections and reversals. */
export const hrPayrollCorrections = pgTable("hr_payroll_corrections", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    sourceRunId: text("source_run_id")
        .notNull()
        .references(() => hrPayrollRuns.id, { onDelete: "restrict" }),
    correctionRunId: text("correction_run_id").references(() => hrPayrollRuns.id, { onDelete: "set null" }),
    cycleId: text("cycle_id")
        .notNull()
        .references(() => hrPayrollCycles.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
        onDelete: "set null",
    }),
    correctionKind: hrPayrollCorrectionKindEnum("correction_kind").notNull(),
    correctionStatus: hrPayrollCorrectionStatusEnum("correction_status")
        .notNull()
        .default("draft"),
    reason: text("reason").notNull(),
    amountDelta: numeric("amount_delta", { precision: 14, scale: 2 }),
    currencyCode: text("currency_code").notNull().default("USD"),
    requestedByUserId: text("requested_by_user_id").notNull(),
    authorizedByUserId: text("authorized_by_user_id"),
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_payroll_corrections_org_source_run_idx").on(table.organizationId, table.sourceRunId),
    index("hr_payroll_corrections_org_status_idx").on(table.organizationId, table.correctionStatus),
]);
/** PAY-030 — payroll audit trail. */
export const hrPayrollAuditEvents = pgTable("hr_payroll_audit_events", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id").references(() => hrPayrollCycles.id, {
        onDelete: "set null",
    }),
    runId: text("run_id").references(() => hrPayrollRuns.id, {
        onDelete: "set null",
    }),
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
    index("hr_payroll_audit_events_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("hr_payroll_audit_events_org_cycle_idx").on(table.organizationId, table.cycleId),
    index("hr_payroll_audit_events_org_run_idx").on(table.organizationId, table.runId),
]);

