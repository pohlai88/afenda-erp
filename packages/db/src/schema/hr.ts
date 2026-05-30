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
