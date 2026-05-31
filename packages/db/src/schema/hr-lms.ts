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

/** LMS-002 — course delivery types. */
export const hrLmsCourseTypeEnum = pgEnum("hr_lms_course_type", [
  "online_course",
  "video_lesson",
  "reading_module",
  "quiz",
  "assessment",
  "certification",
  "compliance_training",
  "blended_learning_reference",
]);

export const hrLmsCourseStatusEnum = pgEnum("hr_lms_course_status", [
  "draft",
  "published",
  "archived",
]);

export const hrLmsDeliveryModeEnum = pgEnum("hr_lms_delivery_mode", [
  "self_paced",
  "instructor_led",
  "blended",
  "external_reference",
]);

export const hrLmsContentRefKindEnum = pgEnum("hr_lms_content_ref_kind", [
  "internal",
  "external",
  "scorm",
  "xapi",
  "external_lms",
]);

export const hrLmsPathKindEnum = pgEnum("hr_lms_path_kind", [
  "role_based",
  "department_based",
  "onboarding",
  "compliance",
  "safety",
  "leadership",
  "certification",
  "general",
]);

export const hrLmsAssignmentKindEnum = pgEnum("hr_lms_assignment_kind", [
  "mandatory",
  "optional",
]);

export const hrLmsEnrollmentStatusEnum = pgEnum("hr_lms_enrollment_status", [
  "pending_approval",
  "enrolled",
  "rejected",
  "withdrawn",
]);

export const hrLmsProgressStatusEnum = pgEnum("hr_lms_progress_status", [
  "not_started",
  "in_progress",
  "completed",
  "failed",
  "overdue",
  "expired",
  "renewed",
  "cancelled",
]);

export const hrLmsAssessmentResultEnum = pgEnum("hr_lms_assessment_result", [
  "passed",
  "failed",
  "in_progress",
]);

export const hrLmsCertificationStatusEnum = pgEnum("hr_lms_certification_status", [
  "active",
  "expired",
  "renewed",
  "revoked",
]);

export const hrLmsReminderKindEnum = pgEnum("hr_lms_reminder_kind", [
  "due_soon",
  "overdue",
  "incomplete",
  "failed",
  "certification_expiring",
]);

export const hrLmsAuditActionEnum = pgEnum("hr_lms_audit_action", [
  "course_setup",
  "learning_path_setup",
  "assignment",
  "enrollment",
  "progress_update",
  "assessment",
  "completion",
  "failure",
  "certification",
  "renewal",
  "reminder",
  "report_export",
]);

/** LMS-001/003 — online learning course catalog. */
export const hrLmsCourses = pgTable(
  "hr_lms_courses",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    provider: text("provider").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(0),
    level: text("level").notNull().default("beginner"),
    language: text("language").notNull().default("en"),
    deliveryMode: hrLmsDeliveryModeEnum("delivery_mode")
      .notNull()
      .default("self_paced"),
    courseType: hrLmsCourseTypeEnum("course_type")
      .notNull()
      .default("online_course"),
    validityDays: integer("validity_days"),
    passingScore: numeric("passing_score", { precision: 5, scale: 2 }),
    attemptLimit: integer("attempt_limit"),
    selfEnrollmentEnabled: boolean("self_enrollment_enabled")
      .notNull()
      .default(false),
    approvalRequired: boolean("approval_required").notNull().default(false),
    scormEnabled: boolean("scorm_enabled").notNull().default(false),
    xapiEnabled: boolean("xapi_enabled").notNull().default(false),
    externalLmsEnabled: boolean("external_lms_enabled").notNull().default(false),
    trainingCourseId: text("training_course_id"),
    courseStatus: hrLmsCourseStatusEnum("course_status")
      .notNull()
      .default("draft"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_lms_courses_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_lms_courses_org_status_idx").on(
      table.organizationId,
      table.courseStatus,
    ),
    index("hr_lms_courses_org_type_idx").on(
      table.organizationId,
      table.courseType,
    ),
  ],
);

/** LMS-004/005 — internal/external/SCORM/xAPI content references. */
export const hrLmsCourseContentRefs = pgTable(
  "hr_lms_course_content_refs",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    courseId: text("course_id")
      .notNull()
      .references(() => hrLmsCourses.id, { onDelete: "cascade" }),
    refKind: hrLmsContentRefKindEnum("ref_kind").notNull(),
    label: text("label").notNull(),
    uri: text("uri").notNull(),
    providerName: text("provider_name"),
    isPrimary: boolean("is_primary").notNull().default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lms_course_content_refs_org_course_idx").on(
      table.organizationId,
      table.courseId,
    ),
  ],
);

/** LMS-006/007 — structured learning paths. */
export const hrLmsLearningPaths = pgTable(
  "hr_lms_learning_paths",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    pathKind: hrLmsPathKindEnum("path_kind").notNull().default("general"),
    targetRoleCode: text("target_role_code"),
    targetDepartmentId: text("target_department_id").references(
      () => hrDepartments.id,
      { onDelete: "set null" },
    ),
    pathStatus: hrLmsCourseStatusEnum("path_status")
      .notNull()
      .default("draft"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_lms_learning_paths_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_lms_learning_paths_org_kind_idx").on(
      table.organizationId,
      table.pathKind,
    ),
  ],
);

export const hrLmsLearningPathCourses = pgTable(
  "hr_lms_learning_path_courses",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    pathId: text("path_id")
      .notNull()
      .references(() => hrLmsLearningPaths.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => hrLmsCourses.id, { onDelete: "cascade" }),
    sequenceOrder: integer("sequence_order").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_lms_learning_path_courses_org_path_order_uidx").on(
      table.organizationId,
      table.pathId,
      table.sequenceOrder,
    ),
    index("hr_lms_learning_path_courses_org_path_idx").on(
      table.organizationId,
      table.pathId,
    ),
  ],
);

/** LMS-008/009/020 — course or path assignments. */
export const hrLmsAssignments = pgTable(
  "hr_lms_assignments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    courseId: text("course_id").references(() => hrLmsCourses.id, {
      onDelete: "cascade",
    }),
    pathId: text("path_id").references(() => hrLmsLearningPaths.id, {
      onDelete: "cascade",
    }),
    assignmentKind: hrLmsAssignmentKindEnum("assignment_kind")
      .notNull()
      .default("optional"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    assignedByUserId: text("assigned_by_user_id").notNull(),
    isComplianceMandatory: boolean("is_compliance_mandatory")
      .notNull()
      .default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lms_assignments_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_lms_assignments_org_course_idx").on(
      table.organizationId,
      table.courseId,
    ),
    index("hr_lms_assignments_org_compliance_idx").on(
      table.organizationId,
      table.isComplianceMandatory,
    ),
  ],
);

/** LMS-010/011 — enrollments including self-enroll and approval. */
export const hrLmsEnrollments = pgTable(
  "hr_lms_enrollments",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => hrLmsCourses.id, { onDelete: "cascade" }),
    assignmentId: text("assignment_id").references(() => hrLmsAssignments.id, {
      onDelete: "set null",
    }),
    enrollmentStatus: hrLmsEnrollmentStatusEnum("enrollment_status")
      .notNull()
      .default("enrolled"),
    selfEnrolled: boolean("self_enrolled").notNull().default(false),
    approvedByUserId: text("approved_by_user_id"),
    enrolledByUserId: text("enrolled_by_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_lms_enrollments_org_employee_course_uidx").on(
      table.organizationId,
      table.employeeId,
      table.courseId,
    ),
    index("hr_lms_enrollments_org_status_idx").on(
      table.organizationId,
      table.enrollmentStatus,
    ),
  ],
);

/** LMS-012/013 — progress tracking. */
export const hrLmsProgress = pgTable(
  "hr_lms_progress",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => hrLmsEnrollments.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => hrLmsCourses.id, { onDelete: "cascade" }),
    progressStatus: hrLmsProgressStatusEnum("progress_status")
      .notNull()
      .default("not_started"),
    completionPercent: numeric("completion_percent", { precision: 5, scale: 2 })
      .notNull()
      .default("0"),
    timeSpentMinutes: integer("time_spent_minutes").notNull().default(0),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
    lessonProgress: jsonb("lesson_progress")
      .$type<Record<string, unknown>>()
      .default({}),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_lms_progress_org_enrollment_uidx").on(
      table.organizationId,
      table.enrollmentId,
    ),
    index("hr_lms_progress_org_employee_status_idx").on(
      table.organizationId,
      table.employeeId,
      table.progressStatus,
    ),
  ],
);

/** LMS-014/015/016 — assessment attempts. */
export const hrLmsAssessmentAttempts = pgTable(
  "hr_lms_assessment_attempts",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => hrLmsEnrollments.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => hrLmsCourses.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").notNull(),
    score: numeric("score", { precision: 5, scale: 2 }),
    passingScore: numeric("passing_score", { precision: 5, scale: 2 }),
    result: hrLmsAssessmentResultEnum("result").notNull().default("in_progress"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lms_assessment_attempts_org_enrollment_idx").on(
      table.organizationId,
      table.enrollmentId,
    ),
    uniqueIndex("hr_lms_assessment_attempts_org_enrollment_attempt_uidx").on(
      table.organizationId,
      table.enrollmentId,
      table.attemptNumber,
    ),
  ],
);

/** LMS-017/018 — certification records. */
export const hrLmsCertifications = pgTable(
  "hr_lms_certifications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => hrLmsCourses.id, { onDelete: "cascade" }),
    enrollmentId: text("enrollment_id").references(() => hrLmsEnrollments.id, {
      onDelete: "set null",
    }),
    certificateCode: text("certificate_code").notNull(),
    certificationStatus: hrLmsCertificationStatusEnum("certification_status")
      .notNull()
      .default("active"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    renewedAt: timestamp("renewed_at", { withTimezone: true }),
    evidenceUri: text("evidence_uri"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lms_certifications_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_lms_certifications_org_status_idx").on(
      table.organizationId,
      table.certificationStatus,
    ),
  ],
);

/** LMS-019 — reminders. */
export const hrLmsReminders = pgTable(
  "hr_lms_reminders",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    courseId: text("course_id").references(() => hrLmsCourses.id, {
      onDelete: "cascade",
    }),
    certificationId: text("certification_id").references(
      () => hrLmsCertifications.id,
      { onDelete: "cascade" },
    ),
    reminderKind: hrLmsReminderKindEnum("reminder_kind").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lms_reminders_org_employee_kind_idx").on(
      table.organizationId,
      table.employeeId,
      table.reminderKind,
    ),
  ],
);

/** LMS-030 — audit trail. */
export const hrLmsAuditEvents = pgTable(
  "hr_lms_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    action: hrLmsAuditActionEnum("action").notNull(),
    actorUserId: text("actor_user_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestampColumns,
  },
  (table) => [
    index("hr_lms_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_lms_audit_events_org_action_idx").on(
      table.organizationId,
      table.action,
    ),
  ],
);
