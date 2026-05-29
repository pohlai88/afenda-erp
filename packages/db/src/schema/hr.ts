import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./common";
import { organizations } from "./organizations";

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

export const hrEmploymentStatusEnum = pgEnum("hr_employment_status", [
  "onboarding",
  "active",
  "probation",
  "confirmed",
  "suspended",
  "notice_period",
  "offboarding",
  "terminated",
  "separated",
  "retired",
  "archived",
]);

export const hrOrgUnitStatusEnum = pgEnum("hr_org_unit_status", [
  "active",
  "planned",
  "frozen",
  "closed",
]);

export const hrAssignmentStatusEnum = pgEnum("hr_assignment_status", [
  "active",
  "superseded",
  "cancelled",
]);

export const hrDocumentClassificationEnum = pgEnum("hr_document_classification", [
  "internal",
  "confidential",
  "restricted",
]);

export const hrDocumentVerificationStatusEnum = pgEnum(
  "hr_document_verification_status",
  ["pending", "verified", "rejected"],
);

export const hrDocumentLifecycleStatusEnum = pgEnum(
  "hr_document_lifecycle_status",
  ["active", "archived"],
);

export const hrLifecycleTransitionStatusEnum = pgEnum(
  "hr_lifecycle_transition_status",
  ["pending", "applied", "cancelled", "rejected", "failed"],
);

export const hrOffboardingStatusEnum = pgEnum("hr_offboarding_status", [
  "in_progress",
  "completed",
  "cancelled",
]);

export const hrOnboardingStatusEnum = pgEnum("hr_onboarding_status", [
  "in_progress",
  "completed",
  "cancelled",
]);

export const hrWorkflowChecklistStatusEnum = pgEnum(
  "hr_workflow_checklist_status",
  ["pending", "done", "waived"],
);

export const hrComplianceObligationStatusEnum = pgEnum(
  "hr_compliance_obligation_status",
  ["active", "archived"],
);

export const hrComplianceExceptionSeverityEnum = pgEnum(
  "hr_compliance_exception_severity",
  ["low", "medium", "high", "critical"],
);

export const hrComplianceExceptionStatusEnum = pgEnum(
  "hr_compliance_exception_status",
  ["open", "in_progress", "resolved", "waived"],
);

export const hrComplianceRequirementStatusEnum = pgEnum(
  "hr_compliance_requirement_status",
  [
    "compliant",
    "pending",
    "at_risk",
    "overdue",
    "expired",
    "waived",
    "non_compliant",
  ],
);

export const hrComplianceWorkEligibilityStatusEnum = pgEnum(
  "hr_compliance_work_eligibility_status",
  [
    "not_applicable",
    "pending_verification",
    "eligible",
    "conditional",
    "ineligible",
    "expired",
  ],
);

export const hrComplianceWorkAuthDocumentTypeEnum = pgEnum(
  "hr_compliance_work_auth_document_type",
  ["work_permit", "visa", "passport", "right_to_work"],
);

export const hrComplianceWorkAuthDocumentStatusEnum = pgEnum(
  "hr_compliance_work_auth_document_status",
  ["missing", "pending_verification", "verified", "rejected", "waived"],
);

export const hrComplianceFilingStatusEnum = pgEnum("hr_compliance_filing_status", [
  "pending",
  "submitted",
  "confirmed",
  "overdue",
  "waived",
]);

export const hrComplianceEvidenceSubmissionStateEnum = pgEnum(
  "hr_compliance_evidence_submission_state",
  ["draft", "submitted", "acknowledged"],
);

export const hrLeaveTypeEnum = pgEnum("hr_leave_type", [
  "annual",
  "sick",
  "unpaid",
  "compassionate",
  "other",
]);

export const hrLeaveRequestStatusEnum = pgEnum("hr_leave_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const hrAttendancePunchTypeEnum = pgEnum("hr_attendance_punch_type", [
  "clock_in",
  "clock_out",
]);

export const hrAttendancePunchStatusEnum = pgEnum("hr_attendance_punch_status", [
  "active",
  "voided",
]);

export const hrAttendanceSourceEnum = pgEnum("hr_attendance_source", [
  "manual",
  "time_clock",
  "import",
]);

export const hrOvertimeTypeEnum = pgEnum("hr_overtime_type", [
  "regular",
  "weekend",
  "holiday",
  "public_holiday",
]);

export const hrOvertimeRequestStatusEnum = pgEnum("hr_overtime_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const hrShiftTemplateStatusEnum = pgEnum("hr_shift_template_status", [
  "active",
  "archived",
]);

export const hrShiftAssignmentStatusEnum = pgEnum("hr_shift_assignment_status", [
  "scheduled",
  "published",
  "cancelled",
]);

export const hrDepartments = pgTable(
  "hr_departments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    parentDepartmentId: text("parent_department_id"),
    orgUnitStatus: hrOrgUnitStatusEnum("org_unit_status")
      .notNull()
      .default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_departments_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_departments_org_archived_idx").on(
      table.organizationId,
      table.archivedAt,
    ),
    index("hr_departments_org_parent_idx").on(
      table.organizationId,
      table.parentDepartmentId,
    ),
  ],
);

export const hrPositions = pgTable(
  "hr_positions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    title: text("title").notNull(),
    departmentId: text("department_id")
      .notNull()
      .references(() => hrDepartments.id, { onDelete: "restrict" }),
    positionStatus: hrOrgUnitStatusEnum("position_status")
      .notNull()
      .default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_positions_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_positions_org_department_idx").on(
      table.organizationId,
      table.departmentId,
    ),
    index("hr_positions_org_archived_idx").on(
      table.organizationId,
      table.archivedAt,
    ),
  ],
);

export const hrEmployees = pgTable(
  "hr_employees",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeNumber: text("employee_number").notNull(),
    legalName: text("legal_name").notNull(),
    preferredName: text("preferred_name"),
    email: text("email"),
    employmentStatus: hrEmploymentStatusEnum("employment_status")
      .notNull()
      .default("active"),
    currentDepartmentId: text("current_department_id").references(
      () => hrDepartments.id,
      { onDelete: "set null" },
    ),
    currentPositionId: text("current_position_id").references(
      () => hrPositions.id,
      { onDelete: "set null" },
    ),
    managerEmployeeId: text("manager_employee_id"),
    employmentStartDate: timestamp("employment_start_date", {
      withTimezone: true,
    }),
    probationEndDate: timestamp("probation_end_date", { withTimezone: true }),
    confirmationDate: timestamp("confirmation_date", { withTimezone: true }),
    countryCode: text("country_code"),
    legalEntityCode: text("legal_entity_code"),
    workLocationCode: text("work_location_code"),
    employmentType: text("employment_type"),
    workerCategory: text("worker_category"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_employees_org_number_uidx").on(
      table.organizationId,
      table.employeeNumber,
    ),
    index("hr_employees_org_status_idx").on(
      table.organizationId,
      table.employmentStatus,
    ),
    index("hr_employees_org_archived_idx").on(
      table.organizationId,
      table.archivedAt,
    ),
    index("hr_employees_org_department_idx").on(
      table.organizationId,
      table.currentDepartmentId,
    ),
    index("hr_employees_org_manager_idx").on(
      table.organizationId,
      table.managerEmployeeId,
    ),
  ],
);

export const hrEmployeeAssignments = pgTable(
  "hr_employee_assignments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    positionId: text("position_id").references(() => hrPositions.id, {
      onDelete: "set null",
    }),
    managerEmployeeId: text("manager_employee_id"),
    effectiveFrom: timestamp("effective_from", {
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    assignmentStatus: hrAssignmentStatusEnum("assignment_status")
      .notNull()
      .default("active"),
    reason: text("reason"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_employee_assignments_org_employee_effective_idx").on(
      table.organizationId,
      table.employeeId,
      table.effectiveFrom,
    ),
    index("hr_employee_assignments_org_active_idx").on(
      table.organizationId,
      table.assignmentStatus,
      table.effectiveTo,
    ),
    index("hr_employee_assignments_org_department_idx").on(
      table.organizationId,
      table.departmentId,
    ),
    index("hr_employee_assignments_org_position_idx").on(
      table.organizationId,
      table.positionId,
    ),
  ],
);

export const hrEmployeeDocuments = pgTable(
  "hr_employee_documents",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    documentType: text("document_type").notNull(),
    title: text("title").notNull(),
    blobUrl: text("blob_url").notNull(),
    payloadHash: text("payload_hash").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    classification: hrDocumentClassificationEnum("classification")
      .notNull()
      .default("internal"),
    verificationStatus: hrDocumentVerificationStatusEnum("verification_status")
      .notNull()
      .default("pending"),
    lifecycleStatus: hrDocumentLifecycleStatusEnum("lifecycle_status")
      .notNull()
      .default("active"),
    effectiveFrom: timestamp("effective_from", {
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_employee_documents_org_employee_type_idx").on(
      table.organizationId,
      table.employeeId,
      table.documentType,
    ),
    index("hr_employee_documents_org_lifecycle_idx").on(
      table.organizationId,
      table.lifecycleStatus,
      table.verificationStatus,
    ),
    index("hr_employee_documents_org_effective_to_idx").on(
      table.organizationId,
      table.effectiveTo,
    ),
  ],
);

export const hrDocumentRequirements = pgTable(
  "hr_document_requirements",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    documentType: text("document_type").notNull(),
    title: text("title").notNull(),
    requiredForStatus: hrEmploymentStatusEnum("required_for_status"),
    graceDaysBeforeDue: integer("grace_days_before_due").notNull().default(0),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_document_requirements_org_type_status_uidx").on(
      table.organizationId,
      table.documentType,
      table.requiredForStatus,
    ),
    index("hr_document_requirements_org_active_idx").on(
      table.organizationId,
      table.active,
    ),
  ],
);

export const hrLifecycleEvents = pgTable(
  "hr_lifecycle_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    previousStatus: hrEmploymentStatusEnum("previous_status"),
    newStatus: hrEmploymentStatusEnum("new_status"),
    effectiveDate: timestamp("effective_date", {
      withTimezone: true,
    }).notNull(),
    reason: text("reason"),
    approvalReference: text("approval_reference"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lifecycle_events_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_lifecycle_events_org_employee_kind_idx").on(
      table.organizationId,
      table.employeeId,
      table.kind,
    ),
    index("hr_lifecycle_events_org_effective_idx").on(
      table.organizationId,
      table.effectiveDate,
    ),
  ],
);

export const hrLifecycleTransitions = pgTable(
  "hr_lifecycle_transitions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    transitionKind: text("transition_kind").notNull(),
    fromStatus: hrEmploymentStatusEnum("from_status").notNull(),
    toStatus: hrEmploymentStatusEnum("to_status").notNull(),
    effectiveDate: timestamp("effective_date", {
      withTimezone: true,
    }).notNull(),
    status: hrLifecycleTransitionStatusEnum("status")
      .notNull()
      .default("pending"),
    reason: text("reason"),
    approvalReference: text("approval_reference"),
    lifecycleEventId: text("lifecycle_event_id").references(
      () => hrLifecycleEvents.id,
      { onDelete: "set null" },
    ),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lifecycle_transitions_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_lifecycle_transitions_org_status_effective_idx").on(
      table.organizationId,
      table.status,
      table.effectiveDate,
    ),
    uniqueIndex("hr_lifecycle_transitions_pending_dedupe_uidx").on(
      table.organizationId,
      table.employeeId,
      table.transitionKind,
      table.effectiveDate,
      table.status,
    ),
  ],
);

export const hrOffboardingCases = pgTable(
  "hr_offboarding_cases",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    status: hrOffboardingStatusEnum("status").notNull().default("in_progress"),
    priorEmploymentStatus: hrEmploymentStatusEnum("prior_employment_status").notNull(),
    reason: text("reason"),
    lastWorkingDate: timestamp("last_working_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_offboarding_cases_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_offboarding_cases_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

export const hrOffboardingClearanceItems = pgTable(
  "hr_offboarding_clearance_items",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    caseId: text("case_id")
      .notNull()
      .references(() => hrOffboardingCases.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    title: text("title").notNull(),
    status: hrWorkflowChecklistStatusEnum("status").notNull().default("pending"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [
    index("hr_offboarding_clearance_org_case_idx").on(
      table.organizationId,
      table.caseId,
    ),
    uniqueIndex("hr_offboarding_clearance_case_code_uidx").on(
      table.caseId,
      table.code,
    ),
  ],
);

export const hrOnboardingCases = pgTable(
  "hr_onboarding_cases",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    status: hrOnboardingStatusEnum("status").notNull().default("in_progress"),
    priorEmploymentStatus: hrEmploymentStatusEnum("prior_employment_status").notNull(),
    targetStatus: hrEmploymentStatusEnum("target_status").notNull().default("active"),
    reason: text("reason"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_onboarding_cases_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_onboarding_cases_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

export const hrOnboardingChecklistItems = pgTable(
  "hr_onboarding_checklist_items",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    caseId: text("case_id")
      .notNull()
      .references(() => hrOnboardingCases.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    title: text("title").notNull(),
    status: hrWorkflowChecklistStatusEnum("status").notNull().default("pending"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [
    index("hr_onboarding_checklist_org_case_idx").on(
      table.organizationId,
      table.caseId,
    ),
    uniqueIndex("hr_onboarding_checklist_case_code_uidx").on(
      table.caseId,
      table.code,
    ),
  ],
);

export const hrComplianceObligations = pgTable(
  "hr_compliance_obligations",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    complianceArea: text("compliance_area").notNull(),
    requirementKind: text("requirement_kind").notNull(),
    status: hrComplianceObligationStatusEnum("status")
      .notNull()
      .default("active"),
    countryCode: text("country_code"),
    legalEntityCode: text("legal_entity_code"),
    workLocationCode: text("work_location_code"),
    employmentType: text("employment_type"),
    workerCategory: text("worker_category"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_compliance_obligations_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_compliance_obligations_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_compliance_obligations_org_area_idx").on(
      table.organizationId,
      table.complianceArea,
      table.status,
    ),
    index("hr_compliance_obligations_org_scope_idx").on(
      table.organizationId,
      table.countryCode,
      table.legalEntityCode,
      table.status,
    ),
  ],
);

export const hrComplianceExceptions = pgTable(
  "hr_compliance_exceptions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    complianceArea: text("compliance_area").notNull(),
    itemType: text("item_type").notNull(),
    title: text("title").notNull(),
    severity: hrComplianceExceptionSeverityEnum("severity")
      .notNull()
      .default("medium"),
    status: hrComplianceExceptionStatusEnum("status")
      .notNull()
      .default("open"),
    correctiveActionDescription: text("corrective_action_description"),
    correctiveActionDueDate: timestamp("corrective_action_due_date", {
      withTimezone: true,
    }),
    resolutionNote: text("resolution_note"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    /** Idempotent key for auto-materialized exceptions (HRM-CMP-017). */
    sourceReferenceId: text("source_reference_id"),
    gapKind: text("gap_kind"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_compliance_exceptions_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_compliance_exceptions_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_compliance_exceptions_org_area_idx").on(
      table.organizationId,
      table.complianceArea,
      table.status,
    ),
    uniqueIndex("hr_compliance_exceptions_org_source_ref_uidx").on(
      table.organizationId,
      table.sourceReferenceId,
    ),
  ],
);

export const hrComplianceEmployeeRequirements = pgTable(
  "hr_compliance_employee_requirements",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    obligationId: text("obligation_id")
      .notNull()
      .references(() => hrComplianceObligations.id, { onDelete: "cascade" }),
    status: hrComplianceRequirementStatusEnum("status")
      .notNull()
      .default("pending"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_compliance_employee_requirements_org_emp_obl_uidx").on(
      table.organizationId,
      table.employeeId,
      table.obligationId,
    ),
    index("hr_compliance_employee_requirements_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_compliance_employee_requirements_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);

export const hrComplianceWorkEligibility = pgTable(
  "hr_compliance_work_eligibility",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    status: hrComplianceWorkEligibilityStatusEnum("status")
      .notNull()
      .default("pending_verification"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_compliance_work_eligibility_org_employee_uidx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_compliance_work_eligibility_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_compliance_work_eligibility_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);

export const hrComplianceFilings = pgTable(
  "hr_compliance_filings",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    obligationId: text("obligation_id")
      .notNull()
      .references(() => hrComplianceObligations.id, { onDelete: "cascade" }),
    status: hrComplianceFilingStatusEnum("status").notNull().default("pending"),
    filingDeadline: timestamp("filing_deadline", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_compliance_filings_org_obl_uidx").on(
      table.organizationId,
      table.obligationId,
    ),
    index("hr_compliance_filings_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

export const hrComplianceWorkAuthorizationDocuments = pgTable(
  "hr_compliance_work_authorization_documents",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    documentType: hrComplianceWorkAuthDocumentTypeEnum("document_type").notNull(),
    status: hrComplianceWorkAuthDocumentStatusEnum("status")
      .notNull()
      .default("missing"),
    documentNumber: text("document_number"),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_compliance_work_auth_docs_org_emp_type_uidx").on(
      table.organizationId,
      table.employeeId,
      table.documentType,
    ),
    index("hr_compliance_work_auth_docs_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_compliance_work_auth_docs_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_compliance_work_auth_docs_org_type_idx").on(
      table.organizationId,
      table.documentType,
    ),
  ],
);

export const hrLeaveRequests = pgTable(
  "hr_leave_requests",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    leaveType: hrLeaveTypeEnum("leave_type").notNull(),
    status: hrLeaveRequestStatusEnum("status").notNull().default("pending"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    durationDays: numeric("duration_days", { precision: 6, scale: 2 }).notNull(),
    reason: text("reason"),
    decisionNote: text("decision_note"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_leave_requests_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_leave_requests_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_leave_requests_org_submitted_idx").on(
      table.organizationId,
      table.submittedAt,
    ),
  ],
);

export const hrAttendanceRecords = pgTable(
  "hr_attendance_records",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    punchType: hrAttendancePunchTypeEnum("punch_type").notNull(),
    status: hrAttendancePunchStatusEnum("status").notNull().default("active"),
    source: hrAttendanceSourceEnum("source").notNull().default("manual"),
    punchedAt: timestamp("punched_at", { withTimezone: true }).notNull(),
    idempotencyKey: text("idempotency_key"),
    notes: text("notes"),
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_attendance_records_org_employee_punched_idx").on(
      table.organizationId,
      table.employeeId,
      table.punchedAt,
    ),
    index("hr_attendance_records_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    uniqueIndex("hr_attendance_records_org_idempotency_uidx").on(
      table.organizationId,
      table.idempotencyKey,
    ),
  ],
);

export const hrOvertimeRequests = pgTable(
  "hr_overtime_requests",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    overtimeType: hrOvertimeTypeEnum("overtime_type").notNull(),
    status: hrOvertimeRequestStatusEnum("status").notNull().default("pending"),
    workDate: timestamp("work_date", { withTimezone: true }).notNull(),
    hours: numeric("hours", { precision: 6, scale: 2 }).notNull(),
    reason: text("reason"),
    decisionNote: text("decision_note"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_overtime_requests_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_overtime_requests_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_overtime_requests_org_submitted_idx").on(
      table.organizationId,
      table.submittedAt,
    ),
  ],
);

export const hrShiftTemplates = pgTable(
  "hr_shift_templates",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    status: hrShiftTemplateStatusEnum("status").notNull().default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_shift_templates_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_shift_templates_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

export const hrShiftAssignments = pgTable(
  "hr_shift_assignments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => hrShiftTemplates.id, { onDelete: "restrict" }),
    status: hrShiftAssignmentStatusEnum("status").notNull().default("scheduled"),
    shiftDate: timestamp("shift_date", { withTimezone: true }).notNull(),
    shiftStart: timestamp("shift_start", { withTimezone: true }).notNull(),
    shiftEnd: timestamp("shift_end", { withTimezone: true }).notNull(),
    notes: text("notes"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_shift_assignments_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_shift_assignments_org_employee_date_idx").on(
      table.organizationId,
      table.employeeId,
      table.shiftDate,
    ),
    index("hr_shift_assignments_org_shift_start_idx").on(
      table.organizationId,
      table.shiftStart,
    ),
  ],
);
