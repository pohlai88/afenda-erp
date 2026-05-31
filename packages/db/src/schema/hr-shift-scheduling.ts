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
import {
  hrDepartments,
  hrEmployees,
  hrPositions,
} from "./hr";
import { organizations } from "./organizations";

const organizationReference = () =>
  organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
  });

/** HRM-SFT-001 — shift template lifecycle. */
export const hrShiftTemplateStatusEnum = pgEnum("hr_shift_template_status", [
  "active",
  "archived",
]);

/** HRM-SFT-002 — operational shift category (time band / allowance class). */
export const hrShiftCategoryEnum = pgEnum("hr_shift_category", [
  "day",
  "evening",
  "night",
  "split",
  "rest",
  "off",
  "holiday",
  "flexible",
  "other",
]);

/** HRM-SFT-003 — scheduling pattern kind. */
export const hrShiftPatternKindEnum = pgEnum("hr_shift_pattern_kind", [
  "fixed",
  "rotating",
  "split",
  "night",
  "weekend",
  "holiday",
  "flexible",
]);

export const hrShiftAssignmentStatusEnum = pgEnum("hr_shift_assignment_status", [
  "scheduled",
  "published",
  "cancelled",
]);

export const hrShiftAssignmentKindEnum = pgEnum("hr_shift_assignment_kind", [
  "shift",
  "rest_day",
  "off_day",
  "holiday",
]);

export const hrShiftRecurrenceStatusEnum = pgEnum("hr_shift_recurrence_status", [
  "active",
  "archived",
]);

export const hrShiftRotationCycleStatusEnum = pgEnum(
  "hr_shift_rotation_cycle_status",
  ["active", "archived"],
);

export const hrShiftSwapRequestStatusEnum = pgEnum(
  "hr_shift_swap_request_status",
  ["pending", "returned", "approved", "rejected", "cancelled", "overridden"],
);

export const hrShiftScheduleChangeStatusEnum = pgEnum(
  "hr_shift_schedule_change_status",
  ["pending", "returned", "approved", "rejected", "cancelled", "overridden"],
);

export const hrShiftAvailabilityKindEnum = pgEnum("hr_shift_availability_kind", [
  "unavailable",
  "preferred",
  "blocked",
]);

/** HRM-SFT-025 — shift scheduling in-app notification kinds. */
export const hrShiftNotificationKindEnum = pgEnum("hr_shift_notification_kind", [
  "roster_published",
  "roster_changed",
  "assignment_changed",
  "swap_submitted",
  "swap_approved",
  "swap_rejected",
  "swap_returned",
  "swap_overridden",
  "schedule_change_submitted",
  "schedule_change_approved",
  "schedule_change_rejected",
  "schedule_change_returned",
  "schedule_change_overridden",
]);

/** HRM-SFT-030 — shift scheduling audit actions. */
export const hrShiftAuditActionEnum = pgEnum("hr_shift_audit_action", [
  "template_created",
  "template_updated",
  "template_archived",
  "assignment_created",
  "assignment_bulk_created",
  "assignment_published",
  "assignment_cancelled",
  "recurrence_created",
  "recurrence_applied",
  "rotation_created",
  "rotation_step_added",
  "rotation_applied",
  "policy_updated",
  "coverage_created",
  "coverage_updated",
  "swap_submitted",
  "swap_approved",
  "swap_rejected",
  "swap_returned",
  "swap_overridden",
  "roster_published",
  "schedule_change_submitted",
  "schedule_change_approved",
  "schedule_change_rejected",
  "schedule_change_returned",
  "schedule_change_overridden",
  "payroll_reference_linked",
  "report_definition_saved",
  "report_exported",
  "notification_enqueued",
]);

export type HrShiftRosterReportFilterPayload = {
  departmentId?: string;
  locationCode?: string;
  grade?: string;
  positionId?: string;
  managerEmployeeId?: string;
  legalEntityCode?: string;
  templateId?: string;
  employeeId?: string;
};

export type HrShiftScheduleChangePayload = {
  assignmentId?: string;
  templateId?: string;
  shiftDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  assignmentKind?: string;
  notes?: string;
};

/** HRM-SFT-001/002/003 — org shift type catalog. */
export const hrShiftTemplates = pgTable(
  "hr_shift_templates",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    breakStartTime: text("break_start_time"),
    breakEndTime: text("break_end_time"),
    workingHoursMinutes: integer("working_hours_minutes").notNull().default(480),
    shiftCategory: hrShiftCategoryEnum("shift_category")
      .notNull()
      .default("day"),
    patternKind: hrShiftPatternKindEnum("pattern_kind")
      .notNull()
      .default("fixed"),
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
    index("hr_shift_templates_org_pattern_idx").on(
      table.organizationId,
      table.patternKind,
    ),
  ],
);

/** HRM-SFT-014/015 — org scheduling policy defaults. */
export const hrShiftSchedulingPolicies = pgTable(
  "hr_shift_scheduling_policies",
  {
    organizationId: organizationReference().primaryKey(),
    minRestHoursBetweenShifts: numeric("min_rest_hours_between_shifts", {
      precision: 4,
      scale: 2,
    })
      .notNull()
      .default("11"),
    maxWeeklyScheduledHours: numeric("max_weekly_scheduled_hours", {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default("48"),
    swapRequestsEnabled: boolean("swap_requests_enabled").notNull().default(true),
    employeeScheduleChangeEnabled: boolean("employee_schedule_change_enabled")
      .notNull()
      .default(true),
    validateAvailabilityOnAssign: boolean("validate_availability_on_assign")
      .notNull()
      .default(true),
    validateLeaveConflictOnAssign: boolean("validate_leave_conflict_on_assign")
      .notNull()
      .default(true),
    updatedByAuthUserId: text("updated_by_auth_user_id"),
    ...timestampColumns,
  },
);

/** HRM-SFT-007 — weekly recurrence generator rules. */
export const hrShiftRecurrenceRules = pgTable(
  "hr_shift_recurrence_rules",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    templateId: text("template_id")
      .notNull()
      .references(() => hrShiftTemplates.id, { onDelete: "restrict" }),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "cascade",
    }),
    daysOfWeek: jsonb("days_of_week")
      .$type<readonly number[]>()
      .notNull()
      .default([]),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    status: hrShiftRecurrenceStatusEnum("status").notNull().default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_shift_recurrence_rules_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_shift_recurrence_rules_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_shift_recurrence_rules_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

/** HRM-SFT-008 — rotating shift cycle header. */
export const hrShiftRotationCycles = pgTable(
  "hr_shift_rotation_cycles",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    cycleLengthDays: integer("cycle_length_days").notNull(),
    status: hrShiftRotationCycleStatusEnum("status")
      .notNull()
      .default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_shift_rotation_cycles_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_shift_rotation_cycles_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
  ],
);

/** HRM-SFT-008 — ordered steps within a rotation cycle. */
export const hrShiftRotationCycleSteps = pgTable(
  "hr_shift_rotation_cycle_steps",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    cycleId: text("cycle_id")
      .notNull()
      .references(() => hrShiftRotationCycles.id, { onDelete: "cascade" }),
    stepIndex: integer("step_index").notNull(),
    templateId: text("template_id").references(() => hrShiftTemplates.id, {
      onDelete: "restrict",
    }),
    isRestDay: boolean("is_rest_day").notNull().default(false),
    label: text("label"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_shift_rotation_cycle_steps_cycle_index_uidx").on(
      table.cycleId,
      table.stepIndex,
    ),
    index("hr_shift_rotation_cycle_steps_org_cycle_idx").on(
      table.organizationId,
      table.cycleId,
    ),
  ],
);

/** HRM-SFT-025 — roster publication stamp per period. */
export const hrShiftRosterPublications = pgTable(
  "hr_shift_roster_publications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    publishedByAuthUserId: text("published_by_auth_user_id").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_shift_roster_publications_org_period_idx").on(
      table.organizationId,
      table.periodStart,
      table.periodEnd,
    ),
    index("hr_shift_roster_publications_org_published_idx").on(
      table.organizationId,
      table.publishedAt,
    ),
  ],
);

/** HRM-SFT-005 — one assignment row per employee per date. */
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
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    positionId: text("position_id").references(() => hrPositions.id, {
      onDelete: "set null",
    }),
    locationCode: text("location_code"),
    assignmentKind: hrShiftAssignmentKindEnum("assignment_kind")
      .notNull()
      .default("shift"),
    status: hrShiftAssignmentStatusEnum("status").notNull().default("scheduled"),
    shiftDate: timestamp("shift_date", { withTimezone: true }).notNull(),
    shiftStart: timestamp("shift_start", { withTimezone: true }).notNull(),
    shiftEnd: timestamp("shift_end", { withTimezone: true }).notNull(),
    notes: text("notes"),
    recurrenceRuleId: text("recurrence_rule_id").references(
      () => hrShiftRecurrenceRules.id,
      { onDelete: "set null" },
    ),
    rotationCycleId: text("rotation_cycle_id").references(
      () => hrShiftRotationCycles.id,
      { onDelete: "set null" },
    ),
    publicationId: text("publication_id").references(
      () => hrShiftRosterPublications.id,
      { onDelete: "set null" },
    ),
    assignedByAuthUserId: text("assigned_by_auth_user_id"),
    payrollReference: text("payroll_reference"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_shift_assignments_org_employee_date_uidx").on(
      table.organizationId,
      table.employeeId,
      table.shiftDate,
    ),
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
    index("hr_shift_assignments_org_department_idx").on(
      table.organizationId,
      table.departmentId,
    ),
    index("hr_shift_assignments_org_publication_idx").on(
      table.organizationId,
      table.publicationId,
    ),
  ],
);

/** HRM-SFT-016/017/018 — minimum staffing by date and scope. */
export const hrShiftCoverageRequirements = pgTable(
  "hr_shift_coverage_requirements",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    requirementDate: timestamp("requirement_date", {
      withTimezone: true,
    }).notNull(),
    templateId: text("template_id").references(() => hrShiftTemplates.id, {
      onDelete: "set null",
    }),
    departmentId: text("department_id").references(() => hrDepartments.id, {
      onDelete: "set null",
    }),
    positionId: text("position_id").references(() => hrPositions.id, {
      onDelete: "set null",
    }),
    locationCode: text("location_code"),
    roleCode: text("role_code"),
    requiredSkillCode: text("required_skill_code"),
    requiredCertificationCode: text("required_certification_code"),
    minHeadcount: integer("min_headcount").notNull(),
    maxHeadcount: integer("max_headcount"),
    notes: text("notes"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_shift_coverage_requirements_org_date_idx").on(
      table.organizationId,
      table.requirementDate,
    ),
    index("hr_shift_coverage_requirements_org_template_idx").on(
      table.organizationId,
      table.templateId,
    ),
    index("hr_shift_coverage_requirements_org_department_idx").on(
      table.organizationId,
      table.departmentId,
    ),
  ],
);

/** HRM-SFT-019..023 — employee shift swap workflow. */
export const hrShiftSwapRequests = pgTable(
  "hr_shift_swap_requests",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    requesterEmployeeId: text("requester_employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    requesterAssignmentId: text("requester_assignment_id")
      .notNull()
      .references(() => hrShiftAssignments.id, { onDelete: "cascade" }),
    targetEmployeeId: text("target_employee_id").references(
      () => hrEmployees.id,
      { onDelete: "set null" },
    ),
    targetAssignmentId: text("target_assignment_id").references(
      () => hrShiftAssignments.id,
      { onDelete: "set null" },
    ),
    status: hrShiftSwapRequestStatusEnum("status").notNull().default("pending"),
    reason: text("reason").notNull(),
    decisionNote: text("decision_note"),
    rejectionReason: text("rejection_reason"),
    overrideReason: text("override_reason"),
    currentApproverAuthUserId: text("current_approver_auth_user_id"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_shift_swap_requests_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_shift_swap_requests_org_requester_idx").on(
      table.organizationId,
      table.requesterEmployeeId,
    ),
    index("hr_shift_swap_requests_org_target_idx").on(
      table.organizationId,
      table.targetEmployeeId,
    ),
    index("hr_shift_swap_requests_org_submitted_idx").on(
      table.organizationId,
      table.submittedAt,
    ),
  ],
);

/** HRM-SFT-028 — saved roster report definitions. */
export const hrShiftRosterReportDefinitions = pgTable(
  "hr_shift_roster_report_definitions",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    filterPayload: jsonb("filter_payload")
      .$type<HrShiftRosterReportFilterPayload>()
      .notNull()
      .default({}),
    createdByAuthUserId: text("created_by_auth_user_id").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("hr_shift_roster_report_definitions_org_code_uidx").on(
      table.organizationId,
      table.code,
    ),
    index("hr_shift_roster_report_definitions_org_name_idx").on(
      table.organizationId,
      table.name,
    ),
  ],
);

/** HRM-SFT-011 — employee availability windows. */
export const hrShiftAvailability = pgTable(
  "hr_shift_availability",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    availabilityKind: hrShiftAvailabilityKindEnum("availability_kind").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    preferredTemplateId: text("preferred_template_id").references(
      () => hrShiftTemplates.id,
      { onDelete: "set null" },
    ),
    reason: text("reason"),
    ...timestampColumns,
  },
  (table) => [
    index("hr_shift_availability_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_shift_availability_org_kind_idx").on(
      table.organizationId,
      table.availabilityKind,
    ),
    index("hr_shift_availability_org_period_idx").on(
      table.organizationId,
      table.startDate,
      table.endDate,
    ),
  ],
);

/** HRM-SFT-024 — manager/employee schedule change requests. */
export const hrShiftScheduleChangeRequests = pgTable(
  "hr_shift_schedule_change_requests",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    requestingEmployeeId: text("requesting_employee_id")
      .notNull()
      .references(() => hrEmployees.id, { onDelete: "cascade" }),
    assignmentId: text("assignment_id").references(() => hrShiftAssignments.id, {
      onDelete: "set null",
    }),
    status: hrShiftScheduleChangeStatusEnum("status")
      .notNull()
      .default("pending"),
    proposedChanges: jsonb("proposed_changes")
      .$type<HrShiftScheduleChangePayload>()
      .notNull(),
    reason: text("reason").notNull(),
    decisionNote: text("decision_note"),
    rejectionReason: text("rejection_reason"),
    overrideReason: text("override_reason"),
    initiatorAuthUserId: text("initiator_auth_user_id"),
    currentApproverAuthUserId: text("current_approver_auth_user_id"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("hr_shift_schedule_change_requests_org_status_idx").on(
      table.organizationId,
      table.status,
    ),
    index("hr_shift_schedule_change_requests_org_requester_idx").on(
      table.organizationId,
      table.requestingEmployeeId,
    ),
    index("hr_shift_schedule_change_requests_org_submitted_idx").on(
      table.organizationId,
      table.submittedAt,
    ),
  ],
);

/** HRM-SFT-025 — org in-app notifications for schedule events. */
export const hrShiftNotifications = pgTable(
  "hr_shift_notifications",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recipientAuthUserId: text("recipient_auth_user_id").notNull(),
    kind: hrShiftNotificationKindEnum("kind").notNull(),
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
    index("hr_shift_notifications_org_recipient_idx").on(
      table.organizationId,
      table.recipientAuthUserId,
    ),
    index("hr_shift_notifications_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_shift_notifications_org_subject_idx").on(
      table.organizationId,
      table.subjectType,
      table.subjectId,
    ),
  ],
);

/** HRM-SFT-030 — durable shift scheduling audit trail. */
export const hrShiftAuditEvents = pgTable(
  "hr_shift_audit_events",
  {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    action: hrShiftAuditActionEnum("action").notNull(),
    templateId: text("template_id").references(() => hrShiftTemplates.id, {
      onDelete: "set null",
    }),
    assignmentId: text("assignment_id").references(() => hrShiftAssignments.id, {
      onDelete: "set null",
    }),
    swapRequestId: text("swap_request_id").references(
      () => hrShiftSwapRequests.id,
      { onDelete: "set null" },
    ),
    scheduleChangeRequestId: text("schedule_change_request_id").references(
      () => hrShiftScheduleChangeRequests.id,
      { onDelete: "set null" },
    ),
    publicationId: text("publication_id").references(
      () => hrShiftRosterPublications.id,
      { onDelete: "set null" },
    ),
    employeeId: text("employee_id").references(() => hrEmployees.id, {
      onDelete: "set null",
    }),
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
    index("hr_shift_audit_events_org_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    index("hr_shift_audit_events_org_action_idx").on(
      table.organizationId,
      table.action,
    ),
    index("hr_shift_audit_events_org_employee_idx").on(
      table.organizationId,
      table.employeeId,
    ),
    index("hr_shift_audit_events_org_assignment_idx").on(
      table.organizationId,
      table.assignmentId,
    ),
  ],
);
