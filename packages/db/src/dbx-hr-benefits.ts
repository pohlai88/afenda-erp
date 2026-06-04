import { boolean, index, integer, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, } from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrEmployeeDocuments, hrEmployees } from "./dbx-hr";
import { organizations } from "./dbx-organizations";
const organizationReference = () => organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
});
export const hrBenefitCategoryEnum = pgEnum("hr_benefit_category", [
    "health",
    "insurance",
    "retirement",
    "welfare",
    "transport",
    "meal",
    "housing",
    "education",
    "wellness",
]);
export const hrBenefitCoverageLevelEnum = pgEnum("hr_benefit_coverage_level", [
    "employee_only",
    "employee_spouse",
    "employee_children",
    "family",
]);
export const hrBenefitCoverageStatusEnum = pgEnum("hr_benefit_coverage_status", [
    "pending",
    "active",
    "waived",
    "suspended",
    "terminated",
    "expired",
]);
export const hrBenefitPlanStatusEnum = pgEnum("hr_benefit_plan_status", [
    "active",
    "archived",
]);
export const hrBenefitEnrollmentChannelEnum = pgEnum("hr_benefit_enrollment_channel", ["new_hire", "open_enrollment", "life_event", "administrative"]);
export const hrBenefitOpenEnrollmentStatusEnum = pgEnum("hr_benefit_open_enrollment_status", ["draft", "scheduled", "active", "closed"]);
export const hrBenefitContributionPayerEnum = pgEnum("hr_benefit_contribution_payer", ["employer", "employee"]);
export const hrBenefitDeductionFrequencyEnum = pgEnum("hr_benefit_deduction_frequency", ["per_payroll", "monthly", "quarterly", "annual"]);
export const hrBenefitLifeEventKindEnum = pgEnum("hr_benefit_life_event_kind", [
    "marriage",
    "divorce",
    "birth",
    "adoption",
    "death",
    "loss_of_coverage",
    "relocation",
    "other",
]);
export const hrBenefitDependentRelationshipEnum = pgEnum("hr_benefit_dependent_relationship", ["spouse", "child", "domestic_partner", "other"]);
export const hrBenefitDocumentRecordKindEnum = pgEnum("hr_benefit_document_record_kind", ["plan", "enrollment", "dependent", "life_event"]);
export const hrBenefitEnrollmentChangeKindEnum = pgEnum("hr_benefit_enrollment_change_kind", ["plan_change", "coverage_change", "dependent_change", "contribution_change"]);
export const hrBenefitProviders = pgTable("hr_benefit_providers", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    externalReference: text("external_reference"),
    active: boolean("active").notNull().default(true),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_benefit_providers_org_code_uidx").on(table.organizationId, table.code),
    index("hr_benefit_providers_org_active_idx").on(table.organizationId, table.active),
]);
export const hrBenefitPlans = pgTable("hr_benefit_plans", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    category: hrBenefitCategoryEnum("category").notNull(),
    providerId: text("provider_id").references(() => hrBenefitProviders.id, {
        onDelete: "set null",
    }),
    planStatus: hrBenefitPlanStatusEnum("plan_status")
        .notNull()
        .default("active"),
    allowsDependents: boolean("allows_dependents").notNull().default(false),
    defaultCoverageLevel: hrBenefitCoverageLevelEnum("default_coverage_level")
        .notNull()
        .default("employee_only"),
    employerContributionAmount: numeric("employer_contribution_amount", {
        precision: 12,
        scale: 2,
    }),
    employeeContributionAmount: numeric("employee_contribution_amount", {
        precision: 12,
        scale: 2,
    }),
    currencyCode: text("currency_code").notNull().default("USD"),
    requiresApproval: boolean("requires_approval").notNull().default(false),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_benefit_plans_org_code_uidx").on(table.organizationId, table.code),
    index("hr_benefit_plans_org_category_idx").on(table.organizationId, table.category, table.planStatus),
    index("hr_benefit_plans_org_provider_idx").on(table.organizationId, table.providerId),
    index("hr_benefit_plans_org_effective_idx").on(table.organizationId, table.effectiveFrom, table.effectiveTo),
]);
export const hrBenefitEligibilityRules = pgTable("hr_benefit_eligibility_rules", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBenefitPlans.id, { onDelete: "cascade" }),
    legalEntityCode: text("legal_entity_code"),
    countryCode: text("country_code"),
    workLocationCode: text("work_location_code"),
    employmentType: text("employment_type"),
    workerCategory: text("worker_category"),
    grade: text("grade"),
    level: text("level"),
    minTenureMonths: integer("min_tenure_months"),
    maxTenureMonths: integer("max_tenure_months"),
    active: boolean("active").notNull().default(true),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_benefit_eligibility_rules_org_plan_idx").on(table.organizationId, table.planId, table.active),
    index("hr_benefit_eligibility_rules_org_scope_idx").on(table.organizationId, table.countryCode, table.legalEntityCode, table.employmentType),
]);
export const hrBenefitOpenEnrollmentWindows = pgTable("hr_benefit_open_enrollment_windows", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    status: hrBenefitOpenEnrollmentStatusEnum("status")
        .notNull()
        .default("draft"),
    enrollmentStartAt: timestamp("enrollment_start_at", {
        withTimezone: true,
    }).notNull(),
    enrollmentEndAt: timestamp("enrollment_end_at", {
        withTimezone: true,
    }).notNull(),
    coverageEffectiveFrom: timestamp("coverage_effective_from", {
        withTimezone: true,
    }).notNull(),
    coverageEffectiveTo: timestamp("coverage_effective_to", {
        withTimezone: true,
    }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_benefit_open_enrollment_windows_org_code_uidx").on(table.organizationId, table.code),
    index("hr_benefit_open_enrollment_windows_org_status_idx").on(table.organizationId, table.status),
    index("hr_benefit_open_enrollment_windows_org_dates_idx").on(table.organizationId, table.enrollmentStartAt, table.enrollmentEndAt),
]);
export const hrBenefitOpenEnrollmentPlans = pgTable("hr_benefit_open_enrollment_plans", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    windowId: text("window_id")
        .notNull()
        .references(() => hrBenefitOpenEnrollmentWindows.id, {
        onDelete: "cascade",
    }),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBenefitPlans.id, { onDelete: "cascade" }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_benefit_open_enrollment_plans_window_plan_uidx").on(table.windowId, table.planId),
    index("hr_benefit_open_enrollment_plans_org_window_idx").on(table.organizationId, table.windowId),
]);
export const hrBenefitLifeEvents = pgTable("hr_benefit_life_events", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    kind: hrBenefitLifeEventKindEnum("kind").notNull(),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    reportedAt: timestamp("reported_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    notes: text("notes"),
    approvalReference: text("approval_reference"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_benefit_life_events_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_benefit_life_events_org_kind_idx").on(table.organizationId, table.kind),
    index("hr_benefit_life_events_org_event_date_idx").on(table.organizationId, table.eventDate),
]);
export const hrBenefitEnrollments = pgTable("hr_benefit_enrollments", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    planId: text("plan_id")
        .notNull()
        .references(() => hrBenefitPlans.id, { onDelete: "restrict" }),
    coverageLevel: hrBenefitCoverageLevelEnum("coverage_level").notNull(),
    coverageStatus: hrBenefitCoverageStatusEnum("coverage_status")
        .notNull()
        .default("pending"),
    enrollmentChannel: hrBenefitEnrollmentChannelEnum("enrollment_channel")
        .notNull()
        .default("administrative"),
    openEnrollmentWindowId: text("open_enrollment_window_id").references(() => hrBenefitOpenEnrollmentWindows.id, { onDelete: "set null" }),
    lifeEventId: text("life_event_id").references(() => hrBenefitLifeEvents.id, {
        onDelete: "set null",
    }),
    coverageStartDate: timestamp("coverage_start_date", {
        withTimezone: true,
    }).notNull(),
    coverageEndDate: timestamp("coverage_end_date", { withTimezone: true }),
    enrollmentDate: timestamp("enrollment_date", { withTimezone: true })
        .notNull()
        .defaultNow(),
    waiverReason: text("waiver_reason"),
    approvalReference: text("approval_reference"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedByUserId: text("approved_by_user_id"),
    enrolledByUserId: text("enrolled_by_user_id"),
    eligibilityOverrideReference: text("eligibility_override_reference"),
    ...timestampColumns,
}, (table) => [
    index("hr_benefit_enrollments_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_benefit_enrollments_org_plan_idx").on(table.organizationId, table.planId),
    index("hr_benefit_enrollments_org_status_idx").on(table.organizationId, table.coverageStatus),
    index("hr_benefit_enrollments_org_coverage_dates_idx").on(table.organizationId, table.coverageStartDate, table.coverageEndDate),
    index("hr_benefit_enrollments_org_open_window_idx").on(table.organizationId, table.openEnrollmentWindowId),
]);
export const hrBenefitEnrollmentDependents = pgTable("hr_benefit_enrollment_dependents", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    enrollmentId: text("enrollment_id")
        .notNull()
        .references(() => hrBenefitEnrollments.id, { onDelete: "cascade" }),
    dependentName: text("dependent_name").notNull(),
    relationship: hrBenefitDependentRelationshipEnum("relationship").notNull(),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    dependentReferenceId: text("dependent_reference_id"),
    eligibilityVerifiedAt: timestamp("eligibility_verified_at", {
        withTimezone: true,
    }),
    coverageStartDate: timestamp("coverage_start_date", {
        withTimezone: true,
    }).notNull(),
    coverageEndDate: timestamp("coverage_end_date", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_benefit_enrollment_dependents_org_enrollment_idx").on(table.organizationId, table.enrollmentId),
]);
export const hrBenefitEnrollmentContributions = pgTable("hr_benefit_enrollment_contributions", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    enrollmentId: text("enrollment_id")
        .notNull()
        .references(() => hrBenefitEnrollments.id, { onDelete: "cascade" }),
    payer: hrBenefitContributionPayerEnum("payer").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    frequency: hrBenefitDeductionFrequencyEnum("frequency")
        .notNull()
        .default("per_payroll"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hr_benefit_enrollment_contributions_org_enrollment_idx").on(table.organizationId, table.enrollmentId),
    index("hr_benefit_enrollment_contributions_org_payer_idx").on(table.organizationId, table.payer),
]);
export const hrBenefitDeductionReferences = pgTable("hr_benefit_deduction_references", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    enrollmentId: text("enrollment_id")
        .notNull()
        .references(() => hrBenefitEnrollments.id, { onDelete: "cascade" }),
    payrollDeductionReference: text("payroll_deduction_reference").notNull(),
    deductionCode: text("deduction_code").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    frequency: hrBenefitDeductionFrequencyEnum("frequency")
        .notNull()
        .default("per_payroll"),
    active: boolean("active").notNull().default(true),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_benefit_deduction_refs_org_payroll_ref_uidx").on(table.organizationId, table.payrollDeductionReference),
    index("hr_benefit_deduction_refs_org_enrollment_idx").on(table.organizationId, table.enrollmentId),
    index("hr_benefit_deduction_refs_org_active_idx").on(table.organizationId, table.active),
]);
export const hrBenefitEnrollmentChanges = pgTable("hr_benefit_enrollment_changes", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    enrollmentId: text("enrollment_id")
        .notNull()
        .references(() => hrBenefitEnrollments.id, { onDelete: "cascade" }),
    changeKind: hrBenefitEnrollmentChangeKindEnum("change_kind").notNull(),
    previousSnapshot: text("previous_snapshot"),
    newSnapshot: text("new_snapshot").notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
        .notNull()
        .defaultNow(),
    changedByUserId: text("changed_by_user_id"),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    index("hr_benefit_enrollment_changes_org_enrollment_idx").on(table.organizationId, table.enrollmentId),
    index("hr_benefit_enrollment_changes_org_kind_idx").on(table.organizationId, table.changeKind),
]);
export const hrBenefitDocumentLinks = pgTable("hr_benefit_document_links", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recordKind: hrBenefitDocumentRecordKindEnum("record_kind").notNull(),
    recordId: text("record_id").notNull(),
    employeeDocumentId: text("employee_document_id").references(() => hrEmployeeDocuments.id, { onDelete: "set null" }),
    externalReference: text("external_reference"),
    documentKind: text("document_kind").notNull(),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    index("hr_benefit_document_links_org_record_idx").on(table.organizationId, table.recordKind, table.recordId),
    index("hr_benefit_document_links_org_document_idx").on(table.organizationId, table.employeeDocumentId),
]);
export const hrBenefitAuditEvents = pgTable("hr_benefit_audit_events", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    enrollmentId: text("enrollment_id").references(() => hrBenefitEnrollments.id, {
        onDelete: "set null",
    }),
    planId: text("plan_id").references(() => hrBenefitPlans.id, {
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
    index("hr_benefit_audit_events_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("hr_benefit_audit_events_org_enrollment_idx").on(table.organizationId, table.enrollmentId),
    index("hr_benefit_audit_events_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_benefit_audit_events_org_action_idx").on(table.organizationId, table.action),
]);

