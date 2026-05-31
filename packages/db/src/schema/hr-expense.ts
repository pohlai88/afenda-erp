import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./common";
import { hrDepartments, hrEmployees } from "./hr";
import { organizations } from "./organizations";

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

/** HRM-EXP-021 — claim lifecycle statuses. */
export const hrExpenseClaimStatusEnum = pgEnum("hr_expense_claim_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "returned",
  "clarification_requested",
  "paid",
  "cancelled",
]);

/** HRM-EXP-016/017 — approval stages (manager, finance, HR, exception). */
export const hrExpenseApprovalStageEnum = pgEnum("hr_expense_approval_stage", [
  "manager",
  "finance",
  "hr",
  "exception",
  "complete",
]);

/** HRM-EXP-017 — routing matrix approver kinds. */
export const hrExpenseApproverKindEnum = pgEnum("hr_expense_approver_kind", [
  "direct_manager",
  "manager_chain",
  "department_head",
  "finance_pool",
  "hr_owner",
  "hr_pool",
  "specific_user",
]);

export const hrExpenseApprovalStatusEnum = pgEnum("hr_expense_approval_status", [
  "pending",
  "approved",
  "rejected",
  "returned",
  "clarification_requested",
]);

/** HRM-EXP-020 — policy exception kinds. */
export const hrExpenseExceptionKindEnum = pgEnum("hr_expense_exception_kind", [
  "over_limit",
  "late_submission",
  "missing_receipt",
  "non_standard",
]);

export const hrExpenseExceptionStatusEnum = pgEnum("hr_expense_exception_status", [
  "open",
  "approved",
  "rejected",
]);

export const hrExpenseAuditActionEnum = pgEnum("hr_expense_audit_action", [
  "claim_submit",
  "claim_approve",
  "claim_reject",
  "claim_return",
  "claim_clarification_request",
  "exception_approve",
  "exception_reject",
  "payment_payroll_staged",
  "payment_ap_staged",
  "payment_reference_recorded",
  "accounting_allocated",
  "report_exported",
  "notification_enqueued",
  "receipt_uploaded",
]);

/** HRM-EXP-022 — payroll vs accounts payable payment channel. */
export const hrExpensePaymentChannelEnum = pgEnum("hr_expense_payment_channel", [
  "payroll",
  "accounts_payable",
]);

/** HRM-EXP-003 — receipt, invoice, or proof of payment. */
export const hrExpenseReceiptKindEnum = pgEnum("hr_expense_receipt_kind", [
  "receipt",
  "invoice",
  "proof_of_payment",
]);

/** HRM-EXP-027 — in-app notification kinds. */
export const hrExpenseNotificationKindEnum = pgEnum("hr_expense_notification_kind", [
  "submitted",
  "approved",
  "rejected",
  "returned",
  "overdue",
  "paid",
]);

export const hrExpenseClaims = pgTable(
  "hr_expense_claims",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "restrict" }),
    claimNumber: text("claim_number").notNull(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    claimStatus: hrExpenseClaimStatusEnum("claim_status")
      .notNull()
      .default("draft"),
    categoryCode: text("category_code").notNull(),
    /** Primary expense date for policy limits and duplicate detection (HRM-EXP-005/009). */
    primaryExpenseDate: timestamp("primary_expense_date", { withTimezone: true }),
    merchantName: text("merchant_name"),
    description: text("description"),
    claimCurrencyCode: text("claim_currency_code").notNull().default("USD"),
    claimAmount: numeric("claim_amount", { precision: 14, scale: 2 }),
    approvedAmount: numeric("approved_amount", { precision: 14, scale: 2 }),
    rejectedAmount: numeric("rejected_amount", { precision: 14, scale: 2 }),
    reimbursableAmount: numeric("reimbursable_amount", { precision: 14, scale: 2 }),
    netPayableAmount: numeric("net_payable_amount", { precision: 14, scale: 2 }),
    /** HRM-EXP-024 — accounting allocation dimensions. */
    legalEntityCode: text("legal_entity_code"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    costCenterCode: text("cost_center_code"),
    projectCode: text("project_code"),
    glReference: text("gl_reference"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedByUserId: text("approved_by_user_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    returnReason: text("return_reason"),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    lineItemsSnapshot: jsonb("line_items_snapshot").$type<Record<string, unknown>>(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_expense_claims_org_number_uidx").on(
      table.organizationId,
      table.claimNumber,
    ),
    index("hr_expense_claims_org_status_idx").on(
      table.organizationId,
      table.claimStatus,
    ),
    index("hr_expense_claims_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_expense_claims_org_category_idx").on(
      table.organizationId,
      table.categoryCode,
    ),
    index("hr_expense_claims_org_department_idx").on(
      table.organizationId,
      table.departmentId,
    ),
    index("hr_expense_claims_org_cost_center_idx").on(
      table.organizationId,
      table.costCenterCode,
    ),
    index("hr_expense_claims_org_project_idx").on(
      table.organizationId,
      table.projectCode,
    ),
    index("hr_expense_claims_org_submitted_idx").on(
      table.organizationId,
      table.submittedAt,
    ),
    index("hr_expense_claims_org_duplicate_probe_idx").on(
      table.organizationId,
      table.employeeId,
      table.primaryExpenseDate,
      table.claimAmount,
      table.merchantName,
    ),
  ],
);

/** HRM-EXP-006/008 — org expense policy header. */
export const hrExpensePolicies = pgTable(
  "hr_expense_policies",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    name: text("name").notNull().default("Default expense policy"),
    defaultCurrencyCode: text("default_currency_code").notNull().default("USD"),
    maxClaimAmountCents: integer("max_claim_amount_cents"),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_expense_policies_org_group_uidx").on(
      table.organizationId,
      table.policyGroupCode,
    ),
    index("hr_expense_policies_org_active_idx").on(
      table.organizationId,
      table.active,
    ),
  ],
);

/** HRM-EXP-004/008 — per-category limits and mandatory receipt flags. */
export const hrExpensePolicyCategoryRules = pgTable(
  "hr_expense_policy_category_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyId: text("policy_id")
      .notNull()
      .references(() => hrExpensePolicies.id, { onDelete: "cascade" }),
    categoryCode: text("category_code").notNull(),
    mandatoryReceipt: boolean("mandatory_receipt").notNull().default(false),
    perClaimLimitCents: integer("per_claim_limit_cents"),
    dailyLimitCents: integer("daily_limit_cents"),
    monthlyLimitCents: integer("monthly_limit_cents"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_expense_policy_category_rules_policy_cat_uidx").on(
      table.policyId,
      table.categoryCode,
    ),
    index("hr_expense_policy_category_rules_org_policy_idx").on(
      table.organizationId,
      table.policyId,
    ),
  ],
);

/** HRM-EXP-007 — eligibility matrix by employee attributes and category. */
export const hrExpenseEligibilityRules = pgTable(
  "hr_expense_eligibility_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    categoryCode: text("category_code"),
    legalEntityCode: text("legal_entity_code"),
    workLocationCode: text("work_location_code"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    grade: text("grade"),
    employmentType: text("employment_type"),
    employeeCategory: text("employee_category"),
    eligible: boolean("eligible").notNull().default(true),
    requiresExceptionApproval: boolean("requires_exception_approval")
      .notNull()
      .default(false),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_expense_eligibility_rules_org_group_cat_idx").on(
      table.organizationId,
      table.policyGroupCode,
      table.categoryCode,
    ),
    index("hr_expense_eligibility_rules_org_scope_idx").on(
      table.organizationId,
      table.legalEntityCode,
      table.workLocationCode,
      table.departmentId,
    ),
  ],
);

/** HRM-EXP-003 — receipt / invoice attachments linked to claims. */
export const hrExpenseClaimReceipts = pgTable(
  "hr_expense_claim_receipts",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    claimId: text("claim_id")
      .notNull()
      .references(() => hrExpenseClaims.id, { onDelete: "cascade" }),
    lineItemId: text("line_item_id"),
    kind: hrExpenseReceiptKindEnum("kind").notNull().default("receipt"),
    title: text("title").notNull(),
    erpDocumentId: text("erp_document_id"),
    blobUrl: text("blob_url").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    receiptFingerprint: text("receipt_fingerprint").notNull(),
    receiptDate: timestamp("receipt_date", { withTimezone: true }),
    merchantName: text("merchant_name"),
    amountCents: integer("amount_cents"),
    currencyCode: text("currency_code"),
    externalReference: text("external_reference"),
    uploadedByAuthUserId: text("uploaded_by_auth_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_expense_claim_receipts_org_claim_idx").on(
      table.organizationId,
      table.claimId,
    ),
    index("hr_expense_claim_receipts_org_fingerprint_idx").on(
      table.organizationId,
      table.receiptFingerprint,
    ),
  ],
);

/** HRM-EXP-022/023 — staged payroll or AP payment references. */
export const hrExpensePaymentReferences = pgTable(
  "hr_expense_payment_references",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    claimId: text("claim_id")
      .notNull()
      .references(() => hrExpenseClaims.id, { onDelete: "cascade" }),
    paymentChannel: hrExpensePaymentChannelEnum("payment_channel").notNull(),
    integrationReference: text("integration_reference").notNull(),
    paymentReference: text("payment_reference"),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    earningsCode: text("earnings_code"),
    active: boolean("active").notNull().default(true),
    stagedAt: timestamp("staged_at", { withTimezone: true }).notNull().defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_expense_payment_refs_org_integration_uidx").on(
      table.organizationId,
      table.integrationReference,
    ),
    index("hr_expense_payment_refs_org_claim_idx").on(
      table.organizationId,
      table.claimId,
    ),
    index("hr_expense_payment_refs_org_channel_idx").on(
      table.organizationId,
      table.paymentChannel,
      table.active,
    ),
  ],
);

/** HRM-EXP-028 — durable expense claim audit trail. */
export const hrExpenseAuditEvents = pgTable(
  "hr_expense_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    claimId: text("claim_id").references(() => hrExpenseClaims.id, {
      onDelete: "set null",
    }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    actorUserId: text("actor_user_id"),
    summary: text("summary").notNull(),
    reason: text("reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_expense_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_expense_audit_events_org_claim_idx").on(
      table.organizationId,
      table.claimId,
    ),
    index("hr_expense_audit_events_org_action_idx").on(
      table.organizationId,
      table.action,
    ),
  ],
);

/** HRM-EXP-027 — org in-app notifications for claim workflow events. */
export const hrExpenseNotifications = pgTable(
  "hr_expense_notifications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recipientAuthUserId: text("recipient_auth_user_id").notNull(),
    kind: hrExpenseNotificationKindEnum("kind").notNull(),
    subjectType: text("subject_type").notNull(),
    subjectId: text("subject_id").notNull(),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_expense_notifications_org_recipient_idx").on(
      table.organizationId,
      table.recipientAuthUserId,
    ),
    index("hr_expense_notifications_org_subject_idx").on(
      table.organizationId,
      table.subjectType,
      table.subjectId,
    ),
  ],
);
