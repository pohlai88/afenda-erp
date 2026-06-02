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

export const hrOrgUnitTypeEnum = pgEnum("hr_org_unit_type", [
  "legal_entity",
  "business_unit",
  "department",
  "sub_department",
  "team",
  "location",
]);

export const hrReportingRelationshipTypeEnum = pgEnum(
  "hr_reporting_relationship_type",
  ["direct", "dotted_line", "matrix"],
);

export const hrOrgStructureEntityTypeEnum = pgEnum(
  "hr_org_structure_entity_type",
  ["org_unit", "position", "reporting_line"],
);

export const hrOrgStructureAuditActionEnum = pgEnum(
  "hr_org_structure_audit_action",
  ["created", "updated", "archived"],
);

export const hrAssignmentStatusEnum = pgEnum("hr_assignment_status", [
  "active",
  "superseded",
  "cancelled",
]);

export const hrIdentityDocumentTypeEnum = pgEnum("hr_identity_document_type", [
  "national_id",
  "passport",
  "work_permit",
  "other",
]);

export const hrEmployeeRecordEventKindEnum = pgEnum(
  "hr_employee_record_event_kind",
  [
    "created",
    "updated",
    "archived",
    "rehired",
    "assignment_changed",
    "status_changed",
    "profile_updated",
    "emergency_contact_updated",
  ],
);

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

export const hrOffboardingExitTypeEnum = pgEnum("hr_offboarding_exit_type", [
  "resignation",
  "termination",
  "retirement",
  "contract_expiry",
  "redundancy",
  "death",
  "mutual_separation",
]);

export const hrOffboardingAssigneeRoleEnum = pgEnum(
  "hr_offboarding_assignee_role",
  [
    "hr",
    "manager",
    "employee",
    "it",
    "finance",
    "payroll",
    "admin",
    "asset_owner",
  ],
);

export const hrOffboardingClearanceCategoryEnum = pgEnum(
  "hr_offboarding_clearance_category",
  ["general", "handover", "access", "asset", "payroll", "leave", "document"],
);

export const hrOffboardingAssetStatusEnum = pgEnum("hr_offboarding_asset_status", [
  "outstanding",
  "returned",
  "damaged",
  "missing",
  "waived",
  "deducted",
]);

export const hrOffboardingApprovalStepStatusEnum = pgEnum(
  "hr_offboarding_approval_step_status",
  ["pending", "approved", "rejected"],
);

export const hrOffboardingRehireEligibilityEnum = pgEnum(
  "hr_offboarding_rehire_eligibility",
  ["eligible", "conditional", "not_eligible", "undecided"],
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

export const hrComplianceEvidenceRecordKindEnum = pgEnum(
  "hr_compliance_evidence_record_kind",
  [
    "filing",
    "employee_requirement",
    "work_auth_document",
    "work_eligibility",
    "exception",
  ],
);

export const hrLeaveTypeEnum = pgEnum("hr_leave_type", [
  "annual",
  "sick",
  "medical",
  "unpaid",
  "maternity",
  "paternity",
  "compassionate",
  "emergency",
  "study",
  "replacement",
  "hospitalization",
  "other",
]);

export const hrLeaveRequestStatusEnum = pgEnum("hr_leave_request_status", [
  "pending",
  "returned",
  "clarification_requested",
  "approved",
  "rejected",
  "cancelled",
]);

export const hrLeaveApprovalStageEnum = pgEnum("hr_leave_approval_stage", [
  "manager",
  "hr",
  "complete",
]);

export const hrLeaveBalanceLedgerKindEnum = pgEnum("hr_leave_balance_ledger_kind", [
  "pending_reserve",
  "pending_release",
  "used",
  "manual_correction",
  "carry_forward",
  "forfeiture",
  "reversal",
  "amendment_delta",
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
  "mobile",
]);

export const hrAttendanceDayStatusEnum = pgEnum("hr_attendance_day_status", [
  "present",
  "absent",
  "late",
  "early_out",
  "half_day",
  "rest_day",
  "off_day",
  "public_holiday",
  "missing_punch",
]);

export const hrAttendanceDayStateEnum = pgEnum("hr_attendance_day_state", [
  "open",
  "computed",
  "locked",
]);

export const hrAttendanceExceptionCodeEnum = pgEnum("hr_attendance_exception_code", [
  "late_arrival",
  "early_out",
  "absent",
  "missing_clock_in",
  "missing_clock_out",
  "unapproved_absence",
]);

export const hrAttendanceCorrectionStatusEnum = pgEnum(
  "hr_attendance_correction_status",
  ["pending", "approved", "rejected", "cancelled"],
);

export const hrLamNotificationKindEnum = pgEnum("hr_lam_notification_kind", [
  "leave_submitted",
  "leave_approved",
  "leave_rejected",
  "leave_cancelled",
  "leave_returned",
  "leave_overdue",
  "attendance_correction_submitted",
  "attendance_correction_decided",
]);

/** HRM-AAT-019 — absence risk classification bands. */
export const hrAatAbsenceRiskLevelEnum = pgEnum("hr_aat_absence_risk_level", [
  "normal",
  "watch",
  "at_risk",
  "high_risk",
  "critical",
]);

/** HRM-AAT-021 — corrective action reference kinds. */
export const hrAatCorrectiveActionKindEnum = pgEnum(
  "hr_aat_corrective_action_kind",
  ["coaching", "hr_review", "attendance_improvement_plan"],
);

/** HRM-AAT-027 — absence analytics notification kinds. */
export const hrAatNotificationKindEnum = pgEnum("hr_aat_notification_kind", [
  "risk_threshold_exceeded",
  "risk_level_escalated",
]);

/** HRM-AAT-028 — analytics snapshot period granularity. */
export const hrAatSnapshotPeriodKindEnum = pgEnum(
  "hr_aat_snapshot_period_kind",
  ["daily", "weekly", "monthly", "quarterly", "yearly"],
);

export const hrOvertimeTypeEnum = pgEnum("hr_overtime_type", [
  "regular",
  "weekend",
  "holiday",
  "public_holiday",
  "rest_day",
  "off_day",
  "night",
  "emergency",
]);

export const hrOvertimeTimingKindEnum = pgEnum("hr_overtime_timing_kind", [
  "planned",
  "actual",
]);

export const hrOvertimeRequestStatusEnum = pgEnum("hr_overtime_request_status", [
  "draft",
  "submitted",
  "pending",
  "approved",
  "rejected",
  "returned",
  "cancelled",
  "payroll_ready",
  "paid",
]);

export const hrOvertimeAuditActionEnum = pgEnum("hr_overtime_audit_action", [
  "request_create",
  "request_draft_save",
  "request_submit",
  "request_cancel",
  "request_approve",
  "request_reject",
  "request_return",
  "request_adjust",
  "eligibility_validate",
  "exception_approve",
  "exception_reject",
  "calculation_apply",
  "payroll_export",
  "payroll_ready",
  "paid",
]);

/** HRM-OTM-007 — day category for rate rule matching. */
export const hrOvertimeDayCategoryEnum = pgEnum("hr_overtime_day_category", [
  "weekday",
  "rest_day",
  "off_day",
  "public_holiday",
]);

/** HRM-OTM-011 — overtime rounding modes. */
export const hrOvertimeRoundingModeEnum = pgEnum("hr_overtime_rounding_mode", [
  "none",
  "down",
  "up",
  "nearest",
]);

/** HRM-OTM-014/019 — policy violation kinds flagged on requests. */
export const hrOvertimeExceptionKindEnum = pgEnum("hr_overtime_exception_kind", [
  "shift_variance",
  "daily_cap",
  "weekly_cap",
  "monthly_cap",
  "statutory_cap",
  "budget_cap",
  "min_duration",
  "attendance_mismatch",
  "late_submission",
  "unplanned",
]);

export const hrOvertimeExceptionStatusEnum = pgEnum(
  "hr_overtime_exception_status",
  ["open", "approved", "rejected"],
);

/** HRM-OTM-015 — manager / HR approval stages. */
export const hrOvertimeApprovalStageEnum = pgEnum("hr_overtime_approval_stage", [
  "manager",
  "hr",
  "complete",
]);

/** HRM-OTM-016 — routing matrix approver kinds. */
export const hrOvertimeApproverKindEnum = pgEnum("hr_overtime_approver_kind", [
  "direct_manager",
  "manager_chain",
  "department_head",
  "hr_owner",
  "hr_pool",
  "specific_user",
]);

/** HRM-OTM-015 — overtime approval record lifecycle. */
export const hrOvertimeApprovalStatusEnum = pgEnum("hr_overtime_approval_status", [
  "pending",
  "approved",
  "rejected",
  "returned",
]);

export const hrDepartments = pgTable(
  "hr_departments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    unitType: hrOrgUnitTypeEnum("unit_type").notNull().default("department"),
    parentDepartmentId: text("parent_department_id"),
    managerEmployeeId: text("manager_employee_id"),
    costCenterCode: text("cost_center_code"),
    locationCode: text("location_code"),
    legalEntityCode: text("legal_entity_code"),
    effectiveFrom: timestamp("effective_from", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
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
    index("hr_departments_org_unit_type_idx").on(
      table.organizationId,
      table.unitType,
    ),
    index("hr_departments_org_effective_idx").on(
      table.organizationId,
      table.effectiveFrom,
      table.effectiveTo,
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
    managerEmployeeId: text("manager_employee_id"),
    costCenterCode: text("cost_center_code"),
    locationCode: text("location_code"),
    effectiveFrom: timestamp("effective_from", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
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
    index("hr_positions_org_effective_idx").on(
      table.organizationId,
      table.effectiveFrom,
      table.effectiveTo,
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
    grade: text("grade"),
    level: text("level"),
    matrixManagerEmployeeId: text("matrix_manager_employee_id"),
    hrOwnerEmployeeId: text("hr_owner_employee_id"),
    contractStartDate: timestamp("contract_start_date", {
      withTimezone: true,
    }),
    contractEndDate: timestamp("contract_end_date", { withTimezone: true }),
    rehiredFromEmployeeId: text("rehired_from_employee_id"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_employees_org_number_uidx").on(
      table.organizationId,
      table.employeeNumber,
    ),
    index("hr_employees_org_rehired_from_idx").on(
      table.organizationId,
      table.rehiredFromEmployeeId,
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

export const hrEmployeeProfiles = pgTable(
  "hr_employee_profiles",
  {
    employeeId: text("employee_id")
      .primaryKey()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    organizationId: organizationReference(),
    identityDocumentType: hrIdentityDocumentTypeEnum("identity_document_type"),
    identityNumber: text("identity_number"),
    nationality: text("nationality"),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    gender: text("gender"),
    maritalStatus: text("marital_status"),
    languagePreference: text("language_preference"),
    personalEmail: text("personal_email"),
    phoneNumber: text("phone_number"),
    residentialAddress: text("residential_address"),
    mailingAddress: text("mailing_address"),
    profilePhotoUrl: text("profile_photo_url"),
    payrollReadyAt: timestamp("payroll_ready_at", { withTimezone: true }),
    complianceReadyAt: timestamp("compliance_ready_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_employee_profiles_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_employee_profiles_org_identity_idx").on(
      table.organizationId,
      table.identityNumber,
    ),
    index("hr_employee_profiles_org_phone_idx").on(
      table.organizationId,
      table.phoneNumber,
    ),
  ],
);

export const hrEmployeeEmergencyContacts = pgTable(
  "hr_employee_emergency_contacts",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    contactName: text("contact_name").notNull(),
    relationship: text("relationship").notNull(),
    phoneNumber: text("phone_number").notNull(),
    isPriority: boolean("is_priority").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [
    index("hr_employee_emergency_contacts_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);

export const hrEmployeeRecordEvents = pgTable(
  "hr_employee_record_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    kind: hrEmployeeRecordEventKindEnum("kind").notNull(),
    fieldName: text("field_name"),
    previousValue: text("previous_value"),
    newValue: text("new_value"),
    effectiveDate: timestamp("effective_date", {
      withTimezone: true,
    }).notNull(),
    reason: text("reason"),
    approvalReference: text("approval_reference"),
    actorUserId: text("actor_user_id"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_employee_record_events_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_employee_record_events_org_effective_idx").on(
      table.organizationId,
      table.effectiveDate,
    ),
    index("hr_employee_record_events_org_kind_idx").on(
      table.organizationId,
      table.kind,
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

export const hrReportingRelationships = pgTable(
  "hr_reporting_relationships",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    managerEmployeeId: text("manager_employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    relationshipType: hrReportingRelationshipTypeEnum("relationship_type")
      .notNull()
      .default("direct"),
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
    index("hr_reporting_rel_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
      table.assignmentStatus,
    ),
    index("hr_reporting_rel_org_manager_idx").on(
      table.organizationId,
      table.managerEmployeeId,
    ),
    index("hr_reporting_rel_org_type_idx").on(
      table.organizationId,
      table.relationshipType,
    ),
  ],
);

export const hrOrgStructureAuditEvents = pgTable(
  "hr_org_structure_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    entityType: hrOrgStructureEntityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: hrOrgStructureAuditActionEnum("action").notNull(),
    previousPayload: text("previous_payload"),
    newPayload: text("new_payload").notNull(),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    changedByUserId: text("changed_by_user_id"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_org_audit_org_entity_idx").on(
      table.organizationId,
      table.entityType,
      table.entityId,
    ),
    index("hr_org_audit_org_created_idx").on(
      table.organizationId,
      table.createdAt,
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
    pathname: text("pathname"),
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
    documentGroup: text("document_group"),
    supersedesDocumentId: text("supersedes_document_id"),
    versionNumber: integer("version_number").notNull().default(1),
    isLatestActive: boolean("is_latest_active").notNull().default(true),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    legalHold: boolean("legal_hold").notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    index("hr_employee_documents_org_latest_active_idx").on(
      table.organizationId,
      table.isLatestActive,
      table.lifecycleStatus,
    ),
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

export const hrDocumentGroups = pgTable(
  "hr_document_groups",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    groupKey: text("group_key").notNull(),
    label: text("label").notNull(),
    mandatoryByDefault: boolean("mandatory_by_default").notNull().default(false),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_document_groups_org_key_uidx").on(
      table.organizationId,
      table.groupKey,
    ),
  ],
);

export const hrDocumentRequirements = pgTable(
  "hr_document_requirements",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    documentType: text("document_type").notNull(),
    documentGroup: text("document_group"),
    title: text("title").notNull(),
    mandatory: boolean("mandatory").notNull().default(true),
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

export const hrDocumentRetentionPolicies = pgTable(
  "hr_document_retention_policies",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    documentType: text("document_type"),
    documentGroup: text("document_group"),
    retentionDays: integer("retention_days").notNull().default(2555),
    archiveOnSeparation: boolean("archive_on_separation").notNull().default(true),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    index("hr_document_retention_policies_org_active_idx").on(
      table.organizationId,
      table.active,
    ),
  ],
);

export const hrDocumentAuditEvents = pgTable(
  "hr_document_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    documentId: text("document_id"),
    employeeId: text("employee_id"),
    action: text("action").notNull(),
    actorUserId: text("actor_user_id"),
    summary: text("summary").notNull(),
    metadata: text("metadata"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_document_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_document_audit_events_org_document_idx").on(
      table.organizationId,
      table.documentId,
    ),
  ],
);

export const hrDocumentAcknowledgments = pgTable(
  "hr_document_acknowledgments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    employeeDocumentId: text("employee_document_id").references(
      () => hrEmployeeDocuments.id,
      { onDelete: "set null" },
    ),
    policyKey: text("policy_key").notNull(),
    policyVersion: text("policy_version").notNull(),
    acknowledgmentMethod: text("acknowledgment_method").notNull(),
    acknowledgedAt: timestamp("acknowledged_at", {
      withTimezone: true,
    }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_document_acknowledgments_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_document_acknowledgments_org_policy_idx").on(
      table.organizationId,
      table.policyKey,
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
    exitType: hrOffboardingExitTypeEnum("exit_type")
      .notNull()
      .default("resignation"),
    reason: text("reason"),
    effectiveDate: timestamp("effective_date", { withTimezone: true }),
    noticeStartDate: timestamp("notice_start_date", { withTimezone: true }),
    noticeEndDate: timestamp("notice_end_date", { withTimezone: true }),
    requiredNoticeDays: integer("required_notice_days"),
    lastWorkingDate: timestamp("last_working_date", { withTimezone: true }),
    exitInterviewScheduledAt: timestamp("exit_interview_scheduled_at", {
      withTimezone: true,
    }),
    exitInterviewFeedback: text("exit_interview_feedback"),
    settlementReadyAt: timestamp("settlement_ready_at", { withTimezone: true }),
    rehireEligibility: hrOffboardingRehireEligibilityEnum("rehire_eligibility")
      .notNull()
      .default("undecided"),
    vacancyTriggered: boolean("vacancy_triggered").notNull().default(false),
    sensitiveDetails: text("sensitive_details"),
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
    index("hr_offboarding_cases_org_exit_type_idx").on(
      table.organizationId,
      table.exitType,
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
    assigneeRole: hrOffboardingAssigneeRoleEnum("assignee_role")
      .notNull()
      .default("hr"),
    category: hrOffboardingClearanceCategoryEnum("category")
      .notNull()
      .default("general"),
    status: hrWorkflowChecklistStatusEnum("status").notNull().default("pending"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    evidenceNote: text("evidence_note"),
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

export const hrOffboardingApprovalSteps = pgTable(
  "hr_offboarding_approval_steps",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    caseId: text("case_id")
      .notNull()
      .references(() => hrOffboardingCases.id, { onDelete: "cascade" }),
    stepCode: text("step_code").notNull(),
    title: text("title").notNull(),
    assigneeRole: hrOffboardingAssigneeRoleEnum("assignee_role").notNull(),
    status: hrOffboardingApprovalStepStatusEnum("status")
      .notNull()
      .default("pending"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [
    index("hr_offboarding_approval_org_case_idx").on(
      table.organizationId,
      table.caseId,
    ),
    uniqueIndex("hr_offboarding_approval_case_code_uidx").on(
      table.caseId,
      table.stepCode,
    ),
  ],
);

export const hrOffboardingAssets = pgTable(
  "hr_offboarding_assets",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    caseId: text("case_id")
      .notNull()
      .references(() => hrOffboardingCases.id, { onDelete: "cascade" }),
    assetCode: text("asset_code").notNull(),
    title: text("title").notNull(),
    status: hrOffboardingAssetStatusEnum("status")
      .notNull()
      .default("outstanding"),
    notes: text("notes"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_offboarding_assets_org_case_idx").on(
      table.organizationId,
      table.caseId,
    ),
    uniqueIndex("hr_offboarding_assets_case_code_uidx").on(
      table.caseId,
      table.assetCode,
    ),
  ],
);

export const hrOffboardingSettlementBlockers = pgTable(
  "hr_offboarding_settlement_blockers",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    caseId: text("case_id")
      .notNull()
      .references(() => hrOffboardingCases.id, { onDelete: "cascade" }),
    blockerCode: text("blocker_code").notNull(),
    title: text("title").notNull(),
    source: text("source").notNull().default("payroll"),
    resolved: boolean("resolved").notNull().default(false),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_offboarding_settlement_blockers_org_case_idx").on(
      table.organizationId,
      table.caseId,
    ),
    uniqueIndex("hr_offboarding_settlement_blockers_case_code_uidx").on(
      table.caseId,
      table.blockerCode,
    ),
  ],
);

export const hrOffboardingDocumentLinks = pgTable(
  "hr_offboarding_document_links",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    caseId: text("case_id")
      .notNull()
      .references(() => hrOffboardingCases.id, { onDelete: "cascade" }),
    documentKind: text("document_kind").notNull(),
    employeeDocumentId: text("employee_document_id").references(
      () => hrEmployeeDocuments.id,
      { onDelete: "set null" },
    ),
    externalReference: text("external_reference"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_offboarding_document_links_org_case_idx").on(
      table.organizationId,
      table.caseId,
    ),
  ],
);

export const hrOffboardingAuditEvents = pgTable(
  "hr_offboarding_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    caseId: text("case_id").references(() => hrOffboardingCases.id, {
      onDelete: "set null",
    }),
    employeeId: text("employee_id"),
    action: text("action").notNull(),
    actorUserId: text("actor_user_id"),
    summary: text("summary").notNull(),
    metadata: text("metadata"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_offboarding_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_offboarding_audit_events_org_case_idx").on(
      table.organizationId,
      table.caseId,
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
    correctiveActionOwnerEmployeeId: text(
      "corrective_action_owner_employee_id",
    ).references(() => hrEmployees.id, { onDelete: "set null" }),
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
    index("hr_compliance_exceptions_org_corrective_owner_idx").on(
      table.organizationId,
      table.correctiveActionOwnerEmployeeId,
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

export const hrComplianceEvidenceLinks = pgTable(
  "hr_compliance_evidence_links",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recordKind: hrComplianceEvidenceRecordKindEnum("record_kind").notNull(),
    recordId: text("record_id").notNull(),
    /** Snapshot label for list surfaces — set at link time from the source record. */
    recordLabel: text("record_label").notNull(),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    employeeDocumentId: text("employee_document_id")
      .notNull()
      .references(() => hrEmployeeDocuments.id, { onDelete: "cascade" }),
    submissionState: hrComplianceEvidenceSubmissionStateEnum("submission_state")
      .notNull()
      .default("draft"),
    notes: text("notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_compliance_evidence_links_org_record_doc_uidx").on(
      table.organizationId,
      table.recordKind,
      table.recordId,
      table.employeeDocumentId,
    ),
    index("hr_compliance_evidence_links_org_record_idx").on(
      table.organizationId,
      table.recordKind,
      table.recordId,
    ),
    index("hr_compliance_evidence_links_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_compliance_evidence_links_org_document_idx").on(
      table.organizationId,
      table.employeeDocumentId,
    ),
    index("hr_compliance_evidence_links_org_state_idx").on(
      table.organizationId,
      table.submissionState,
    ),
  ],
);

export const hrLeavePolicies = pgTable(
  "hr_leave_policies",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    minNoticeDays: integer("min_notice_days").notNull().default(1),
    maxConsecutiveDays: integer("max_consecutive_days"),
    requireHrApprovalWhenDaysGte: integer("require_hr_approval_when_days_gte"),
    requireHrApprovalLeaveTypes: jsonb("require_hr_approval_leave_types")
      .$type<readonly string[]>()
      .notNull()
      .default([]),
    managerChainMaxDepth: integer("manager_chain_max_depth").notNull().default(3),
    allowCancellationWhilePending: boolean("allow_cancellation_while_pending")
      .notNull()
      .default(true),
    allowAmendmentAfterApproval: boolean("allow_amendment_after_approval")
      .notNull()
      .default(false),
    carryForwardEnabled: boolean("carry_forward_enabled").notNull().default(true),
    maxCarryForwardDays: numeric("max_carry_forward_days", {
      precision: 6,
      scale: 2,
    }),
    forfeitureAtYearEnd: boolean("forfeiture_at_year_end").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_leave_policies_org_group_uidx").on(
      table.organizationId,
      table.policyGroupCode,
    ),
  ],
);

export const hrLeaveBlackoutPeriods = pgTable(
  "hr_leave_blackout_periods",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    label: text("label").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    leaveTypes: jsonb("leave_types").$type<readonly string[] | null>(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_leave_blackout_org_start_idx").on(
      table.organizationId,
      table.startAt,
    ),
  ],
);

export const hrLeaveTypeConfigs = pgTable(
  "hr_leave_type_configs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    leaveType: hrLeaveTypeEnum("leave_type").notNull(),
    label: text("label").notNull(),
    requiresSupportingDocument: boolean("requires_supporting_document")
      .notNull()
      .default(false),
    requiresMedicalCertificate: boolean("requires_medical_certificate")
      .notNull()
      .default(false),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_leave_type_configs_org_group_type_uidx").on(
      table.organizationId,
      table.policyGroupCode,
      table.leaveType,
    ),
    index("hr_leave_type_configs_org_group_idx").on(
      table.organizationId,
      table.policyGroupCode,
    ),
  ],
);

export const hrLeaveEntitlementRules = pgTable(
  "hr_leave_entitlement_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    leaveType: hrLeaveTypeEnum("leave_type").notNull(),
    legalEntityCode: text("legal_entity_code"),
    countryCode: text("country_code"),
    workLocationCode: text("work_location_code"),
    employmentType: text("employment_type"),
    grade: text("grade"),
    minTenureMonths: integer("min_tenure_months"),
    maxTenureMonths: integer("max_tenure_months"),
    annualEntitlementDays: numeric("annual_entitlement_days", {
      precision: 8,
      scale: 2,
    }).notNull(),
    requiresConfirmation: boolean("requires_confirmation").notNull().default(false),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_leave_entitlement_rules_org_group_type_idx").on(
      table.organizationId,
      table.policyGroupCode,
      table.leaveType,
    ),
    index("hr_leave_entitlement_rules_org_effective_idx").on(
      table.organizationId,
      table.effectiveFrom,
      table.effectiveTo,
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
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    approvalStage: hrLeaveApprovalStageEnum("approval_stage")
      .notNull()
      .default("manager"),
    currentApproverAuthUserId: text("current_approver_auth_user_id"),
    entitlementYear: integer("entitlement_year").notNull(),
    supportingDocumentId: text("supporting_document_id").references(
      () => hrEmployeeDocuments.id,
      { onDelete: "set null" },
    ),
    medicalCertificateReference: text("medical_certificate_reference"),
    panelClinicReference: text("panel_clinic_reference"),
    hospitalizationReference: text("hospitalization_reference"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    durationDays: numeric("duration_days", { precision: 6, scale: 2 }).notNull(),
    reason: text("reason"),
    decisionNote: text("decision_note"),
    rejectionReason: text("rejection_reason"),
    returnedNote: text("returned_note"),
    clarificationNote: text("clarification_note"),
    amendmentOfRequestId: text("amendment_of_request_id"),
    policySnapshot: jsonb("policy_snapshot").$type<Record<string, unknown>>(),
    payrollDeductionReference: text("payroll_deduction_reference"),
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
    index("hr_leave_requests_org_approver_idx").on(
      table.organizationId,
      table.currentApproverAuthUserId,
    ),
    index("hr_leave_requests_org_payroll_ref_idx").on(
      table.organizationId,
      table.payrollDeductionReference,
    ),
  ],
);

export const hrLeaveBalances = pgTable(
  "hr_leave_balances",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    leaveType: hrLeaveTypeEnum("leave_type").notNull(),
    entitlementYear: integer("entitlement_year").notNull(),
    openingDays: numeric("opening_days", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    earnedDays: numeric("earned_days", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    usedDays: numeric("used_days", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    pendingDays: numeric("pending_days", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    adjustedDays: numeric("adjusted_days", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    forfeitedDays: numeric("forfeited_days", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    carriedForwardDays: numeric("carried_forward_days", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_leave_balances_org_employee_type_year_uidx").on(
      table.organizationId,
      table.employeeId,
      table.leaveType,
      table.entitlementYear,
    ),
    index("hr_leave_balances_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);

export const hrLeaveBalanceLedger = pgTable(
  "hr_leave_balance_ledger",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    balanceId: text("balance_id")
      .notNull()
      .references(() => hrLeaveBalances.id, { onDelete: "cascade" }),
    leaveRequestId: text("leave_request_id").references(() => hrLeaveRequests.id, {
      onDelete: "set null",
    }),
    kind: hrLeaveBalanceLedgerKindEnum("kind").notNull(),
    amountDays: numeric("amount_days", { precision: 8, scale: 2 }).notNull(),
    reason: text("reason").notNull(),
    authorizedByAuthUserId: text("authorized_by_auth_user_id"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_leave_balance_ledger_org_balance_idx").on(
      table.organizationId,
      table.balanceId,
    ),
    index("hr_leave_balance_ledger_org_request_idx").on(
      table.organizationId,
      table.leaveRequestId,
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

export const hrAttendanceDays = pgTable(
  "hr_attendance_days",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    workDate: timestamp("work_date", { withTimezone: true }).notNull(),
    workCalendarCode: text("work_calendar_code").notNull().default("default"),
    status: hrAttendanceDayStatusEnum("status").notNull(),
    dayState: hrAttendanceDayStateEnum("day_state").notNull().default("open"),
    calculationSnapshot: jsonb("calculation_snapshot").$type<
      Record<string, unknown>
    >(),
    payrollDeductionReference: text("payroll_deduction_reference"),
    latenessDeductionReference: text("lateness_deduction_reference"),
    absenceDeductionReference: text("absence_deduction_reference"),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_attendance_days_org_employee_date_uidx").on(
      table.organizationId,
      table.employeeId,
      table.workDate,
    ),
    index("hr_attendance_days_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_attendance_days_org_calendar_idx").on(
      table.organizationId,
      table.workCalendarCode,
    ),
    index("hr_attendance_days_org_payroll_ref_idx").on(
      table.organizationId,
      table.payrollDeductionReference,
    ),
  ],
);

export const hrAttendancePolicies = pgTable(
  "hr_attendance_policies",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    attendanceCorrectionsEnabled: boolean("attendance_corrections_enabled")
      .notNull()
      .default(true),
    graceMinutesLate: integer("grace_minutes_late").notNull().default(15),
    standardStartMinutes: integer("standard_start_minutes").notNull().default(540),
    standardEndMinutes: integer("standard_end_minutes").notNull().default(1020),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_attendance_policies_org_group_uidx").on(
      table.organizationId,
      table.policyGroupCode,
    ),
  ],
);

export const hrAttendanceCorrectionRequests = pgTable(
  "hr_attendance_correction_requests",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    attendanceDayId: text("attendance_day_id")
      .notNull()
      .references(() => hrAttendanceDays.id, { onDelete: "cascade" }),
    exceptionCode: hrAttendanceExceptionCodeEnum("exception_code").notNull(),
    status: hrAttendanceCorrectionStatusEnum("status")
      .notNull()
      .default("pending"),
    proposedStatus: hrAttendanceDayStatusEnum("proposed_status"),
    reason: text("reason").notNull(),
    decisionNote: text("decision_note"),
    currentApproverAuthUserId: text("current_approver_auth_user_id"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_attendance_correction_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_attendance_correction_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_attendance_correction_org_day_idx").on(
      table.organizationId,
      table.attendanceDayId,
    ),
  ],
);

export const hrLamNotifications = pgTable(
  "hr_lam_notifications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recipientAuthUserId: text("recipient_auth_user_id").notNull(),
    kind: hrLamNotificationKindEnum("kind").notNull(),
    subjectType: text("subject_type").notNull(),
    subjectId: text("subject_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lam_notifications_org_recipient_idx").on(
      table.organizationId,
      table.recipientAuthUserId,
    ),
    index("hr_lam_notifications_org_subject_idx").on(
      table.organizationId,
      table.subjectType,
      table.subjectId,
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
    timingKind: hrOvertimeTimingKindEnum("timing_kind")
      .notNull()
      .default("planned"),
    status: hrOvertimeRequestStatusEnum("status").notNull().default("submitted"),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    workDate: timestamp("work_date", { withTimezone: true }).notNull(),
    startTime: text("start_time"),
    endTime: text("end_time"),
    hours: numeric("hours", { precision: 6, scale: 2 }).notNull(),
    payableMinutes: integer("payable_minutes"),
    amountCents: integer("amount_cents"),
    earningCode: text("earning_code"),
    reason: text("reason"),
    decisionNote: text("decision_note"),
    returnReason: text("return_reason"),
    eligibilityExceptionReason: text("eligibility_exception_reason"),
    dayCategory: hrOvertimeDayCategoryEnum("day_category"),
    approvalStage: hrOvertimeApprovalStageEnum("approval_stage")
      .notNull()
      .default("manager"),
    currentApproverAuthUserId: text("current_approver_auth_user_id"),
    approvalSnapshot: jsonb("approval_snapshot").$type<Record<string, unknown>>(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    payrollReadyAt: timestamp("payroll_ready_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
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
    index("hr_overtime_requests_org_work_date_idx").on(
      table.organizationId,
      table.workDate,
    ),
  ],
);

/** HRM-OTM-004 — eligibility rules scoped by legal entity, location, policy group, and org attributes. */
export const hrOvertimeEligibilityRules = pgTable(
  "hr_overtime_eligibility_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    overtimeType: hrOvertimeTypeEnum("overtime_type"),
    legalEntityCode: text("legal_entity_code"),
    countryCode: text("country_code"),
    workLocationCode: text("work_location_code"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    roleCode: text("role_code"),
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
    index("hr_overtime_eligibility_rules_org_group_type_idx").on(
      table.organizationId,
      table.policyGroupCode,
      table.overtimeType,
    ),
    index("hr_overtime_eligibility_rules_org_scope_idx").on(
      table.organizationId,
      table.legalEntityCode,
      table.countryCode,
      table.workLocationCode,
    ),
    index("hr_overtime_eligibility_rules_org_effective_idx").on(
      table.organizationId,
      table.effectiveFrom,
      table.effectiveTo,
    ),
  ],
);

/** HRM-OTM-029 — overtime audit trail events. */
export const hrOvertimeAuditEvents = pgTable(
  "hr_overtime_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    requestId: text("request_id").references(() => hrOvertimeRequests.id, {
      onDelete: "set null",
    }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    action: hrOvertimeAuditActionEnum("action").notNull(),
    actorAuthUserId: text("actor_auth_user_id"),
    actorEmployeeId: text("actor_employee_id"),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_overtime_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_overtime_audit_events_org_request_idx").on(
      table.organizationId,
      table.requestId,
    ),
    index("hr_overtime_audit_events_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);

/** HRM-OTM-026 — overtime lifecycle notification kinds. */
export const hrOvertimeNotificationKindEnum = pgEnum(
  "hr_overtime_notification_kind",
  [
    "request_submitted",
    "request_approved",
    "request_rejected",
    "request_returned",
    "request_cancelled",
    "request_overdue",
    "payroll_ready",
  ],
);

export const hrOvertimeNotifications = pgTable(
  "hr_overtime_notifications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recipientAuthUserId: text("recipient_auth_user_id").notNull(),
    kind: hrOvertimeNotificationKindEnum("kind").notNull(),
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
    index("hr_overtime_notifications_org_recipient_idx").on(
      table.organizationId,
      table.recipientAuthUserId,
    ),
    index("hr_overtime_notifications_org_subject_idx").on(
      table.organizationId,
      table.subjectType,
      table.subjectId,
    ),
  ],
);

/** HRM-OTM-011/012/013/010 — org overtime policy (caps, rounding, attendance compare). */
export const hrOvertimePolicies = pgTable(
  "hr_overtime_policies",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    compareAttendanceEnabled: boolean("compare_attendance_enabled")
      .notNull()
      .default(false),
    minOvertimeMinutes: integer("min_overtime_minutes").notNull().default(0),
    roundingMode: hrOvertimeRoundingModeEnum("rounding_mode")
      .notNull()
      .default("none"),
    roundingIntervalMinutes: integer("rounding_interval_minutes")
      .notNull()
      .default(15),
    graceMinutesBeforeRounding: integer("grace_minutes_before_rounding")
      .notNull()
      .default(0),
    dailyCapMinutes: integer("daily_cap_minutes"),
    weeklyCapMinutes: integer("weekly_cap_minutes"),
    monthlyCapMinutes: integer("monthly_cap_minutes"),
    statutoryCapMinutes: integer("statutory_cap_minutes"),
    budgetCapMinutes: integer("budget_cap_minutes"),
    attendanceVarianceToleranceMinutes: integer(
      "attendance_variance_tolerance_minutes",
    )
      .notNull()
      .default(15),
    shiftVarianceToleranceMinutes: integer("shift_variance_tolerance_minutes")
      .notNull()
      .default(15),
    requireHrSecondApproval: boolean("require_hr_second_approval")
      .notNull()
      .default(false),
    managerChainMaxDepth: integer("manager_chain_max_depth").notNull().default(3),
    enforceClaimDeadlineOnSubmit: boolean("enforce_claim_deadline_on_submit")
      .notNull()
      .default(false),
    claimDeadlineDays: integer("claim_deadline_days"),
    allowCompensatoryTime: boolean("allow_compensatory_time")
      .notNull()
      .default(false),
    compensatoryLeaveTypeCode: text("compensatory_leave_type_code"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_overtime_policies_org_group_uidx").on(
      table.organizationId,
      table.policyGroupCode,
    ),
  ],
);

/** HRM-OTM-016 — dynamic approver routing matrix. */
export const hrOvertimeApprovalRoutes = pgTable(
  "hr_overtime_approval_routes",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    name: text("name").notNull(),
    priority: integer("priority").notNull().default(0),
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    costCenterCode: text("cost_center_code"),
    workLocationCode: text("work_location_code"),
    grade: text("grade"),
    minEstimatedAmountCents: integer("min_estimated_amount_cents"),
    maxEstimatedAmountCents: integer("max_estimated_amount_cents"),
    requiresEligibilityException: boolean("requires_eligibility_exception")
      .notNull()
      .default(false),
    requiresPolicyException: boolean("requires_policy_exception")
      .notNull()
      .default(false),
    approverKind: hrOvertimeApproverKindEnum("approver_kind").notNull(),
    specificApproverAuthUserId: text("specific_approver_auth_user_id"),
    managerChainMaxDepth: integer("manager_chain_max_depth"),
    active: boolean("active").notNull().default(true),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_overtime_approval_routes_org_group_idx").on(
      table.organizationId,
      table.policyGroupCode,
    ),
    index("hr_overtime_approval_routes_org_priority_idx").on(
      table.organizationId,
      table.priority,
    ),
  ],
);

/** HRM-OTM-015 — approval workflow record (hrm_approval equivalent). */
export const hrOvertimeApprovals = pgTable(
  "hr_overtime_approvals",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    requestId: text("request_id")
      .notNull()
      .references(() => hrOvertimeRequests.id, { onDelete: "cascade" }),
    status: hrOvertimeApprovalStatusEnum("status").notNull().default("pending"),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    assignedApproverAuthUserId: text("assigned_approver_auth_user_id"),
    decidedByAuthUserId: text("decided_by_auth_user_id"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_overtime_approvals_org_request_uidx").on(
      table.organizationId,
      table.requestId,
    ),
    index("hr_overtime_approvals_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

/** HRM-OTM-007 — pay rate multipliers by type, day, shift, employee group, country. */
export const hrOvertimeRateRules = pgTable(
  "hr_overtime_rate_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    name: text("name").notNull(),
    overtimeType: hrOvertimeTypeEnum("overtime_type"),
    dayCategory: hrOvertimeDayCategoryEnum("day_category"),
    shiftCategory: text("shift_category"),
    employeeCategory: text("employee_category"),
    countryCode: text("country_code"),
    multiplier: numeric("multiplier", { precision: 5, scale: 2 })
      .notNull()
      .default("1.50"),
    earningCode: text("earning_code").notNull().default("OT"),
    priority: integer("priority").notNull().default(0),
    effectiveFrom: timestamp("effective_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_overtime_rate_rules_org_group_idx").on(
      table.organizationId,
      table.policyGroupCode,
    ),
    index("hr_overtime_rate_rules_org_effective_idx").on(
      table.organizationId,
      table.effectiveFrom,
      table.effectiveTo,
    ),
  ],
);

/** HRM-OTM-014 — policy violations requiring exception clearance before final approve. */
export const hrOvertimeExceptions = pgTable(
  "hr_overtime_exceptions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    requestId: text("request_id")
      .notNull()
      .references(() => hrOvertimeRequests.id, { onDelete: "cascade" }),
    kind: hrOvertimeExceptionKindEnum("kind").notNull(),
    status: hrOvertimeExceptionStatusEnum("status").notNull().default("open"),
    message: text("message").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedByAuthUserId: text("resolved_by_auth_user_id"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_overtime_exceptions_org_request_idx").on(
      table.organizationId,
      table.requestId,
    ),
    index("hr_overtime_exceptions_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    uniqueIndex("hr_overtime_exceptions_org_request_kind_uidx").on(
      table.organizationId,
      table.requestId,
      table.kind,
    ),
  ],
);

/** HRM-OTM-020/021 — calculation snapshot after approval. */
export const hrOvertimeCalculationSnapshots = pgTable(
  "hr_overtime_calculation_snapshots",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    requestId: text("request_id")
      .notNull()
      .references(() => hrOvertimeRequests.id, { onDelete: "cascade" }),
    requestedMinutes: integer("requested_minutes").notNull(),
    attendanceMinutes: integer("attendance_minutes"),
    roundedMinutes: integer("rounded_minutes").notNull(),
    cappedMinutes: integer("capped_minutes").notNull(),
    payableMinutes: integer("payable_minutes").notNull(),
    rateMultiplier: numeric("rate_multiplier", { precision: 5, scale: 2 })
      .notNull(),
    earningCode: text("earning_code").notNull(),
    amountCents: integer("amount_cents"),
    rateRuleId: text("rate_rule_id").references(() => hrOvertimeRateRules.id, {
      onDelete: "set null",
    }),
    calculationDetail: jsonb("calculation_detail").$type<
      Record<string, unknown>
    >(),
    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_overtime_calculation_snapshots_org_request_uidx").on(
      table.organizationId,
      table.requestId,
    ),
  ],
);

/** HRM-AAT-018 — org-level configurable absence risk thresholds. */
export const hrAatAbsenceRiskThresholds = pgTable(
  "hr_aat_absence_risk_thresholds",
  {
    organizationId: organizationReference().primaryKey(),
    watchAbsenceRatePercent: numeric("watch_absence_rate_percent", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("5"),
    atRiskAbsenceRatePercent: numeric("at_risk_absence_rate_percent", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("10"),
    highRiskAbsenceRatePercent: numeric("high_risk_absence_rate_percent", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("15"),
    criticalAbsenceRatePercent: numeric("critical_absence_rate_percent", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("25"),
    watchAbsenceFrequency: integer("watch_absence_frequency").notNull().default(3),
    atRiskAbsenceFrequency: integer("at_risk_absence_frequency")
      .notNull()
      .default(5),
    highRiskAbsenceFrequency: integer("high_risk_absence_frequency")
      .notNull()
      .default(7),
    criticalAbsenceFrequency: integer("critical_absence_frequency")
      .notNull()
      .default(10),
    updatedByAuthUserId: text("updated_by_auth_user_id"),
    ...timestampColumns,
  },
);

/** HRM-AAT-021 — insight-linked corrective action references. */
export const hrAatCorrectiveActionRefs = pgTable(
  "hr_aat_corrective_action_refs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    insightKind: text("insight_kind").notNull(),
    insightRef: text("insight_ref"),
    actionKind: hrAatCorrectiveActionKindEnum("action_kind").notNull(),
    externalReference: text("external_reference").notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    notes: text("notes"),
    createdByAuthUserId: text("created_by_auth_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_aat_corrective_refs_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_aat_corrective_refs_org_insight_idx").on(
      table.organizationId,
      table.insightKind,
      table.insightRef,
    ),
  ],
);

/** HRM-AAT-028 — historical absence analytics snapshots by period. */
export const hrAatAnalyticsSnapshots = pgTable(
  "hr_aat_analytics_snapshots",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    periodKind: hrAatSnapshotPeriodKindEnum("period_kind")
      .notNull()
      .default("monthly"),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    dimension: text("dimension").notNull(),
    snapshotPayload: jsonb("snapshot_payload")
      .$type<Record<string, unknown>>()
      .notNull(),
    generatedByAuthUserId: text("generated_by_auth_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_aat_snapshots_org_period_idx").on(
      table.organizationId,
      table.periodStart,
      table.periodEnd,
    ),
    uniqueIndex("hr_aat_snapshots_org_period_dim_unique").on(
      table.organizationId,
      table.periodKind,
      table.periodStart,
      table.periodEnd,
      table.dimension,
    ),
  ],
);

/** HRM-AAT-027 — HR/manager notifications when absence risk exceeds thresholds. */
export const hrAatNotifications = pgTable(
  "hr_aat_notifications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recipientAuthUserId: text("recipient_auth_user_id").notNull(),
    recipientRole: text("recipient_role").notNull(),
    kind: hrAatNotificationKindEnum("kind").notNull(),
    subjectType: text("subject_type").notNull(),
    subjectId: text("subject_id").notNull(),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "cascade",
    }),
    riskLevel: hrAatAbsenceRiskLevelEnum("risk_level").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_aat_notifications_org_recipient_idx").on(
      table.organizationId,
      table.recipientAuthUserId,
    ),
    index("hr_aat_notifications_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_aat_notifications_org_subject_idx").on(
      table.organizationId,
      table.subjectType,
      table.subjectId,
    ),
  ],
);

/** HRM-FWA-002 — canonical flexible work arrangement kinds. */
export const hrFwaArrangementKindEnum = pgEnum("hr_fwa_arrangement_kind", [
  "hybrid",
  "remote",
  "compressed_week",
  "flexible_hours",
  "staggered_hours",
  "part_time",
  "temporary",
]);

export const hrFwaArrangementStatusEnum = pgEnum("hr_fwa_arrangement_status", [
  "draft",
  "pending",
  "active",
  "suspended",
  "terminated",
  "expired",
]);

export const hrFwaRequestStatusEnum = pgEnum("hr_fwa_request_status", [
  "pending",
  "returned",
  "approved",
  "rejected",
  "cancelled",
]);

export const hrFwaRequestInitiatorEnum = pgEnum("hr_fwa_request_initiator", [
  "employee",
  "manager",
  "hr",
]);

export const hrFwaApprovalStageKindEnum = pgEnum("hr_fwa_approval_stage_kind", [
  "manager",
  "hr",
  "department",
  "exception",
]);

export const hrFwaApprovalStageStatusEnum = pgEnum(
  "hr_fwa_approval_stage_status",
  ["pending", "approved", "rejected", "skipped"],
);

export const hrFwaRemoteLocationKindEnum = pgEnum("hr_fwa_remote_location_kind", [
  "home_office",
  "client_site",
  "branch",
  "project_site",
  "other",
]);

export const hrFwaComplianceBreachKindEnum = pgEnum(
  "hr_fwa_compliance_breach_kind",
  [
    "excessive_remote_days",
    "missed_office_days",
    "unapproved_remote_location",
    "incomplete_attendance",
    "working_hours_non_compliance",
  ],
);

export const hrFwaComplianceBreachStatusEnum = pgEnum(
  "hr_fwa_compliance_breach_status",
  ["open", "acknowledged", "resolved", "waived"],
);

export const hrFwaAuditActionEnum = pgEnum("hr_fwa_audit_action", [
  "request_submitted",
  "eligibility_validated",
  "eligibility_failed",
  "approval",
  "rejection",
  "returned",
  "renewal",
  "suspension",
  "termination",
  "exception_approved",
  "compliance_breach",
  "schedule_updated",
  "payroll_reference",
]);

export type HrFwaSchedulePatternDetails = {
  workDays?: readonly number[];
  officeDays?: readonly number[];
  remoteDays?: readonly number[];
  restDays?: readonly number[];
  coreHoursStartMinutes?: number;
  coreHoursEndMinutes?: number;
  flexibleStartEarliestMinutes?: number;
  flexibleStartLatestMinutes?: number;
  flexibleEndEarliestMinutes?: number;
  flexibleEndLatestMinutes?: number;
  expectedWeeklyHours?: number;
  extendedDailyHours?: number;
  compressedWorkingDaysPerWeek?: number;
};

/** HRM-FWA-003 — policy grouping for FWA eligibility and routing. */
export const hrFwaPolicyGroups = pgTable(
  "hr_fwa_policy_groups",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    minOfficeDaysPerWeek: integer("min_office_days_per_week"),
    maxRemoteDaysPerWeek: integer("max_remote_days_per_week"),
    requireHrApproval: boolean("require_hr_approval").notNull().default(true),
    requireDepartmentApproval: boolean("require_department_approval")
      .notNull()
      .default(false),
    allowExceptionApproval: boolean("allow_exception_approval")
      .notNull()
      .default(true),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_fwa_policy_groups_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_fwa_policy_groups_org_active_idx").on(
      table.organizationId,
      table.active,
    ),
  ],
);

/** HRM-FWA-001 — configurable flexible work arrangement types per org. */
export const hrFwaArrangementTypeConfigs = pgTable(
  "hr_fwa_arrangement_type_configs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    arrangementKind: hrFwaArrangementKindEnum("arrangement_kind").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    requiresSupportingDocument: boolean("requires_supporting_document")
      .notNull()
      .default(false),
    requiresRemoteLocation: boolean("requires_remote_location")
      .notNull()
      .default(false),
    minDurationDays: integer("min_duration_days"),
    maxDurationDays: integer("max_duration_days"),
    active: boolean("active").notNull().default(true),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_fwa_type_configs_org_group_kind_uidx").on(
      table.organizationId,
      table.policyGroupCode,
      table.arrangementKind,
    ),
    index("hr_fwa_type_configs_org_group_idx").on(
      table.organizationId,
      table.policyGroupCode,
    ),
    index("hr_fwa_type_configs_org_active_idx").on(
      table.organizationId,
      table.active,
    ),
  ],
);

/** HRM-FWA-003 — eligibility rules scoped by org attributes and policy group. */
export const hrFwaEligibilityRules = pgTable(
  "hr_fwa_eligibility_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    arrangementKind: hrFwaArrangementKindEnum("arrangement_kind"),
    legalEntityCode: text("legal_entity_code"),
    countryCode: text("country_code"),
    workLocationCode: text("work_location_code"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    roleCode: text("role_code"),
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
    index("hr_fwa_eligibility_rules_org_group_kind_idx").on(
      table.organizationId,
      table.policyGroupCode,
      table.arrangementKind,
    ),
    index("hr_fwa_eligibility_rules_org_scope_idx").on(
      table.organizationId,
      table.legalEntityCode,
      table.countryCode,
      table.workLocationCode,
    ),
    index("hr_fwa_eligibility_rules_org_effective_idx").on(
      table.organizationId,
      table.effectiveFrom,
      table.effectiveTo,
    ),
  ],
);

export const hrFwaSchedulePatterns = pgTable(
  "hr_fwa_schedule_patterns",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    label: text("label"),
    patternDetails: jsonb("pattern_details")
      .$type<HrFwaSchedulePatternDetails>()
      .notNull()
      .default({}),
    ...timestampColumns,
  },
  (table) => [
    index("hr_fwa_schedule_patterns_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);

export const hrFwaRemoteLocations = pgTable(
  "hr_fwa_remote_locations",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    locationKind: hrFwaRemoteLocationKindEnum("location_kind")
      .notNull()
      .default("home_office"),
    countryCode: text("country_code"),
    regionCode: text("region_code"),
    addressLine: text("address_line"),
    isApproved: boolean("is_approved").notNull().default(false),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedByAuthUserId: text("approved_by_auth_user_id"),
    restrictionNotes: text("restriction_notes"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_fwa_remote_locations_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_fwa_remote_locations_org_approved_idx").on(
      table.organizationId,
      table.isApproved,
    ),
  ],
);

export const hrFwaRequests = pgTable(
  "hr_fwa_requests",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    arrangementKind: hrFwaArrangementKindEnum("arrangement_kind").notNull(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    status: hrFwaRequestStatusEnum("status").notNull().default("pending"),
    initiatorKind: hrFwaRequestInitiatorEnum("initiator_kind")
      .notNull()
      .default("employee"),
    initiatorEmployeeId: text("initiator_employee_id"),
    initiatorAuthUserId: text("initiator_auth_user_id"),
    reason: text("reason"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    schedulePatternId: text("schedule_pattern_id").references(
      () => hrFwaSchedulePatterns.id,
      { onDelete: "set null" },
    ),
    remoteLocationId: text("remote_location_id").references(
      () => hrFwaRemoteLocations.id,
      { onDelete: "set null" },
    ),
    supportingDocumentId: text("supporting_document_id").references(
      () => hrEmployeeDocuments.id,
      { onDelete: "set null" },
    ),
    approvalStage: hrFwaApprovalStageKindEnum("approval_stage")
      .notNull()
      .default("manager"),
    currentApproverAuthUserId: text("current_approver_auth_user_id"),
    eligibilitySnapshot: jsonb("eligibility_snapshot").$type<
      Record<string, unknown>
    >(),
    policySnapshot: jsonb("policy_snapshot").$type<Record<string, unknown>>(),
    exceptionRequested: boolean("exception_requested").notNull().default(false),
    rejectionReason: text("rejection_reason"),
    decisionNote: text("decision_note"),
    returnedNote: text("returned_note"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_fwa_requests_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_fwa_requests_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_fwa_requests_org_submitted_idx").on(
      table.organizationId,
      table.submittedAt,
    ),
    index("hr_fwa_requests_org_approver_idx").on(
      table.organizationId,
      table.currentApproverAuthUserId,
    ),
    index("hr_fwa_requests_org_kind_idx").on(
      table.organizationId,
      table.arrangementKind,
    ),
  ],
);

export const hrFwaApprovalStages = pgTable(
  "hr_fwa_approval_stages",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    requestId: text("request_id")
      .notNull()
      .references(() => hrFwaRequests.id, { onDelete: "cascade" }),
    stageKind: hrFwaApprovalStageKindEnum("stage_kind").notNull(),
    title: text("title").notNull(),
    assigneeRole: text("assignee_role"),
    assigneeAuthUserId: text("assignee_auth_user_id"),
    status: hrFwaApprovalStageStatusEnum("status")
      .notNull()
      .default("pending"),
    sortOrder: integer("sort_order").notNull().default(0),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    decisionNote: text("decision_note"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_fwa_approval_stages_org_request_idx").on(
      table.organizationId,
      table.requestId,
    ),
    uniqueIndex("hr_fwa_approval_stages_request_kind_uidx").on(
      table.requestId,
      table.stageKind,
    ),
  ],
);

export const hrFwaArrangements = pgTable(
  "hr_fwa_arrangements",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    requestId: text("request_id").references(() => hrFwaRequests.id, {
      onDelete: "set null",
    }),
    arrangementKind: hrFwaArrangementKindEnum("arrangement_kind").notNull(),
    policyGroupCode: text("policy_group_code").notNull().default("default"),
    status: hrFwaArrangementStatusEnum("status").notNull().default("active"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    reviewDate: timestamp("review_date", { withTimezone: true }),
    renewalDate: timestamp("renewal_date", { withTimezone: true }),
    schedulePatternId: text("schedule_pattern_id").references(
      () => hrFwaSchedulePatterns.id,
      { onDelete: "set null" },
    ),
    remoteLocationId: text("remote_location_id").references(
      () => hrFwaRemoteLocations.id,
      { onDelete: "set null" },
    ),
    reason: text("reason"),
    exceptionApproved: boolean("exception_approved").notNull().default(false),
    exceptionReason: text("exception_reason"),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    suspensionReason: text("suspension_reason"),
    terminatedAt: timestamp("terminated_at", { withTimezone: true }),
    terminationReason: text("termination_reason"),
    payrollReference: text("payroll_reference"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_fwa_arrangements_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_fwa_arrangements_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_fwa_arrangements_org_effective_idx").on(
      table.organizationId,
      table.effectiveFrom,
      table.effectiveTo,
    ),
    index("hr_fwa_arrangements_org_kind_idx").on(
      table.organizationId,
      table.arrangementKind,
    ),
    index("hr_fwa_arrangements_org_payroll_ref_idx").on(
      table.organizationId,
      table.payrollReference,
    ),
  ],
);

export const hrFwaComplianceBreaches = pgTable(
  "hr_fwa_compliance_breaches",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    arrangementId: text("arrangement_id")
      .notNull()
      .references(() => hrFwaArrangements.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    breachKind: hrFwaComplianceBreachKindEnum("breach_kind").notNull(),
    status: hrFwaComplianceBreachStatusEnum("status")
      .notNull()
      .default("open"),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    expectedValue: text("expected_value"),
    actualValue: text("actual_value"),
    description: text("description").notNull(),
    detectedAt: timestamp("detected_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: text("resolution_note"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_fwa_compliance_breaches_org_arrangement_idx").on(
      table.organizationId,
      table.arrangementId,
    ),
    index("hr_fwa_compliance_breaches_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_fwa_compliance_breaches_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_fwa_compliance_breaches_org_detected_idx").on(
      table.organizationId,
      table.detectedAt,
    ),
  ],
);

/** HRM-FWA-029 — in-app notifications for FWA lifecycle events. */
export const hrFwaNotificationKindEnum = pgEnum("hr_fwa_notification_kind", [
  "request_submitted",
  "request_approved",
  "request_rejected",
  "request_returned",
  "arrangement_expiring",
  "arrangement_renewed",
  "arrangement_suspended",
  "arrangement_terminated",
  "compliance_breach",
  "review_due",
]);

export const hrFwaNotifications = pgTable(
  "hr_fwa_notifications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recipientAuthUserId: text("recipient_auth_user_id").notNull(),
    kind: hrFwaNotificationKindEnum("kind").notNull(),
    subjectType: text("subject_type").notNull(),
    subjectId: text("subject_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_fwa_notifications_org_recipient_idx").on(
      table.organizationId,
      table.recipientAuthUserId,
    ),
    index("hr_fwa_notifications_org_subject_idx").on(
      table.organizationId,
      table.subjectType,
      table.subjectId,
    ),
  ],
);

export const hrFwaAuditEvents = pgTable(
  "hr_fwa_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    arrangementId: text("arrangement_id").references(() => hrFwaArrangements.id, {
      onDelete: "set null",
    }),
    requestId: text("request_id").references(() => hrFwaRequests.id, {
      onDelete: "set null",
    }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
    action: hrFwaAuditActionEnum("action").notNull(),
    actorAuthUserId: text("actor_auth_user_id"),
    actorEmployeeId: text("actor_employee_id"),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_fwa_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_fwa_audit_events_org_arrangement_idx").on(
      table.organizationId,
      table.arrangementId,
    ),
    index("hr_fwa_audit_events_org_request_idx").on(
      table.organizationId,
      table.requestId,
    ),
    index("hr_fwa_audit_events_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
  ],
);
