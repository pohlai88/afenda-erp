import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, } from "drizzle-orm/pg-core";
import { erpPriorityEnum, organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrDepartments, hrEmployees, hrPositions } from "./dbx-hr";
import { organizations } from "./dbx-organizations";
const organizationReference = () => organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
});
export type HrmCareerSkillRequirement = {
    readonly skillCode: string;
    readonly targetLevel: number | string;
    readonly label?: string | null;
};
export type HrmCareerCompetencyRequirement = {
    readonly competencyCode: string;
    readonly targetLevel: number | string;
    readonly label?: string | null;
};
export type HrmCareerDiscussionParticipant = {
    readonly employeeId?: string | null;
    readonly userId?: string | null;
    readonly role?: string | null;
    readonly displayName?: string | null;
};
export type HrmCareerAgreedAction = {
    readonly summary: string;
    readonly ownerEmployeeId?: string | null;
    readonly dueDate?: string | null;
    readonly completed?: boolean | null;
};
/** HRM-CAR-002 — career path progression kinds. */
export const hrCareerPathKindEnum = pgEnum("hr_career_path_kind", [
    "vertical",
    "lateral",
    "specialist",
    "leadership",
    "functional",
    "cross_functional",
]);
export const hrCareerPathFrameworkStatusEnum = pgEnum("hr_career_path_framework_status", ["draft", "active", "archived"]);
export const hrDevelopmentPlanStatusEnum = pgEnum("hr_development_plan_status", [
    "draft",
    "active",
    "on_hold",
    "completed",
    "cancelled",
    "archived",
]);
/** HRM-CAR-010 — development goal types. */
export const hrDevelopmentGoalTypeEnum = pgEnum("hr_development_goal_type", [
    "skill",
    "competency",
    "certification",
    "leadership",
    "project",
    "mentoring",
    "coaching",
]);
/** HRM-CAR-012 — development goal lifecycle. */
export const hrDevelopmentGoalStatusEnum = pgEnum("hr_development_goal_status", [
    "not_started",
    "in_progress",
    "completed",
    "overdue",
    "blocked",
    "cancelled",
    "deferred",
]);
/** HRM-CAR-024 — readiness classification. */
export const hrEmployeeReadinessLevelEnum = pgEnum("hr_employee_readiness_level", [
    "not_ready",
    "developing",
    "near_ready",
    "ready",
    "role_ready",
]);
export const hrDevelopmentMilestoneStatusEnum = pgEnum("hr_development_milestone_status", ["not_started", "in_progress", "completed", "overdue", "cancelled"]);
export const hrDevelopmentLearningActionStatusEnum = pgEnum("hr_development_learning_action_status", ["planned", "in_progress", "completed", "cancelled"]);
export const hrDevelopmentStretchAssignmentKindEnum = pgEnum("hr_development_stretch_assignment_kind", ["project", "acting_role", "cross_functional", "leadership_exposure"]);
export const hrDevelopmentStretchAssignmentStatusEnum = pgEnum("hr_development_stretch_assignment_status", ["planned", "active", "completed", "cancelled"]);
export const hrDevelopmentMentorCoachStatusEnum = pgEnum("hr_development_mentor_coach_status", ["active", "completed", "cancelled"]);
export const hrDevelopmentSessionKindEnum = pgEnum("hr_development_session_kind", [
    "mentor",
    "coach",
]);
export const hrEmployeeTargetRoleSourceEnum = pgEnum("hr_employee_target_role_source", ["employee", "manager", "hr"]);
/** HRM-CAR-001 — org career path framework catalog. */
export const hrmCareerPathFrameworks = pgTable("hrm_career_path_framework", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    pathKind: hrCareerPathKindEnum("path_kind").notNull(),
    frameworkStatus: hrCareerPathFrameworkStatusEnum("framework_status")
        .notNull()
        .default("draft"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hrm_career_path_framework_org_code_uidx").on(table.organizationId, table.code),
    index("hrm_career_path_framework_org_status_idx").on(table.organizationId, table.frameworkStatus),
    index("hrm_career_path_framework_org_path_kind_idx").on(table.organizationId, table.pathKind),
]);
/** Ordered stages within a career path framework. */
export const hrmCareerPathStages = pgTable("hrm_career_path_stage", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    frameworkId: text("framework_id")
        .notNull()
        .references(() => hrmCareerPathFrameworks.id, { onDelete: "cascade" }),
    stageOrder: integer("stage_order").notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    expectedDurationMonths: integer("expected_duration_months"),
    requiredSkillRefs: jsonb("required_skill_refs")
        .$type<readonly HrmCareerSkillRequirement[]>()
        .notNull()
        .default([]),
    requiredCompetencyRefs: jsonb("required_competency_refs")
        .$type<readonly HrmCareerCompetencyRequirement[]>()
        .notNull()
        .default([]),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hrm_career_path_stage_org_framework_code_uidx").on(table.organizationId, table.frameworkId, table.code),
    uniqueIndex("hrm_career_path_stage_org_framework_order_uidx").on(table.organizationId, table.frameworkId, table.stageOrder),
    index("hrm_career_path_stage_org_framework_idx").on(table.organizationId, table.frameworkId),
]);
/** HRM-CAR-003 — one aspiration row per employee. */
export const hrmEmployeeCareerAspirations = pgTable("hrm_employee_career_aspiration", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    preferredRoleTitle: text("preferred_role_title"),
    preferredDepartmentId: text("preferred_department_id").references(() => hrDepartments.id, { onDelete: "set null" }),
    preferredLocationCode: text("preferred_location_code"),
    mobilityPreference: text("mobility_preference"),
    careerInterestNotes: text("career_interest_notes"),
    updatedByUserId: text("updated_by_user_id"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hrm_employee_career_aspiration_org_employee_uidx").on(table.organizationId, table.employeeId),
    index("hrm_employee_career_aspiration_org_dept_idx").on(table.organizationId, table.preferredDepartmentId),
]);
/** HRM-CAR-004/005 — employee target role with org-structure refs. */
export const hrmEmployeeTargetRoles = pgTable("hrm_employee_target_role", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    primaryTarget: boolean("primary_target").notNull().default(true),
    targetRoleTitle: text("target_role_title").notNull(),
    jobFamily: text("job_family"),
    grade: text("grade"),
    positionId: text("position_id").references(() => hrPositions.id, {
        onDelete: "set null",
    }),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    frameworkId: text("framework_id").references(() => hrmCareerPathFrameworks.id, {
        onDelete: "set null",
    }),
    stageId: text("stage_id").references(() => hrmCareerPathStages.id, {
        onDelete: "set null",
    }),
    targetRoleSource: hrEmployeeTargetRoleSourceEnum("target_role_source")
        .notNull()
        .default("employee"),
    recommendedByUserId: text("recommended_by_user_id"),
    requiredSkillRequirements: jsonb("required_skill_requirements")
        .$type<readonly HrmCareerSkillRequirement[]>()
        .notNull()
        .default([]),
    requiredCompetencyRequirements: jsonb("required_competency_requirements")
        .$type<readonly HrmCareerCompetencyRequirement[]>()
        .notNull()
        .default([]),
    expectedReadinessDate: timestamp("expected_readiness_date", {
        withTimezone: true,
    }),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hrm_employee_target_role_org_employee_uidx").on(table.organizationId, table.employeeId),
    index("hrm_employee_target_role_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hrm_employee_target_role_org_dept_idx").on(table.organizationId, table.departmentId),
    index("hrm_employee_target_role_org_job_family_idx").on(table.organizationId, table.jobFamily),
]);
/** HRM-CAR-009 — personalized development plan. */
export const hrmDevelopmentPlans = pgTable("hrm_development_plan", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    targetRoleId: text("target_role_id").references(() => hrmEmployeeTargetRoles.id, {
        onDelete: "set null",
    }),
    code: text("code").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    planStatus: hrDevelopmentPlanStatusEnum("plan_status")
        .notNull()
        .default("draft"),
    startDate: timestamp("start_date", { withTimezone: true }),
    targetCompletionDate: timestamp("target_completion_date", {
        withTimezone: true,
    }),
    managerReviewNotes: text("manager_review_notes"),
    managerReviewedAt: timestamp("manager_reviewed_at", { withTimezone: true }),
    managerReviewedByUserId: text("manager_reviewed_by_user_id"),
    createdByUserId: text("created_by_user_id"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hrm_development_plan_org_employee_code_uidx").on(table.organizationId, table.employeeId, table.code),
    index("hrm_development_plan_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hrm_development_plan_org_status_idx").on(table.organizationId, table.planStatus),
    index("hrm_development_plan_org_target_role_idx").on(table.organizationId, table.targetRoleId),
]);
/** HRM-CAR-010/012 — goals within a development plan. */
export const hrmDevelopmentGoals = pgTable("hrm_development_goal", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrmDevelopmentPlans.id, { onDelete: "cascade" }),
    goalType: hrDevelopmentGoalTypeEnum("goal_type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    goalStatus: hrDevelopmentGoalStatusEnum("goal_status")
        .notNull()
        .default("not_started"),
    priority: erpPriorityEnum("priority").notNull().default("medium"),
    targetCompletionDate: timestamp("target_completion_date", {
        withTimezone: true,
    }),
    skillCode: text("skill_code"),
    competencyCode: text("competency_code"),
    progressPercent: integer("progress_percent").notNull().default(0),
    evidenceNotes: text("evidence_notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hrm_development_goal_org_plan_idx").on(table.organizationId, table.planId),
    index("hrm_development_goal_org_plan_status_idx").on(table.organizationId, table.planId, table.goalStatus),
    index("hrm_development_goal_org_plan_type_idx").on(table.organizationId, table.planId, table.goalType),
]);
/** HRM-CAR-011 — milestones per goal. */
export const hrmDevelopmentMilestones = pgTable("hrm_development_milestone", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    goalId: text("goal_id")
        .notNull()
        .references(() => hrmDevelopmentGoals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    targetDate: timestamp("target_date", { withTimezone: true }).notNull(),
    ownerEmployeeId: text("owner_employee_id").references(() => hrEmployees.id, {
        onDelete: "set null",
    }),
    ownerUserId: text("owner_user_id"),
    priority: erpPriorityEnum("priority").notNull().default("medium"),
    completionCriteria: text("completion_criteria"),
    milestoneStatus: hrDevelopmentMilestoneStatusEnum("milestone_status")
        .notNull()
        .default("not_started"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hrm_development_milestone_org_goal_idx").on(table.organizationId, table.goalId),
    index("hrm_development_milestone_org_goal_target_date_idx").on(table.organizationId, table.goalId, table.targetDate),
    index("hrm_development_milestone_org_status_target_date_idx").on(table.organizationId, table.milestoneStatus, table.targetDate),
]);
/** HRM-CAR-014 — learning actions; optional training course ref (no FK until T&D schema). */
export const hrmDevelopmentLearningActions = pgTable("hrm_development_learning_action", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrmDevelopmentPlans.id, { onDelete: "cascade" }),
    goalId: text("goal_id").references(() => hrmDevelopmentGoals.id, {
        onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    trainingCourseId: text("training_course_id"),
    externalTrainingRef: text("external_training_ref"),
    learningActionStatus: hrDevelopmentLearningActionStatusEnum("learning_action_status")
        .notNull()
        .default("planned"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestampColumns,
}, (table) => [
    index("hrm_development_learning_action_org_plan_idx").on(table.organizationId, table.planId),
    index("hrm_development_learning_action_org_course_idx").on(table.organizationId, table.trainingCourseId),
]);
/** HRM-CAR-018 — stretch / project / acting-role exposure. */
export const hrmDevelopmentStretchAssignments = pgTable("hrm_development_stretch_assignment", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrmDevelopmentPlans.id, { onDelete: "cascade" }),
    assignmentKind: hrDevelopmentStretchAssignmentKindEnum("assignment_kind").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    positionId: text("position_id").references(() => hrPositions.id, {
        onDelete: "set null",
    }),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    assignmentStatus: hrDevelopmentStretchAssignmentStatusEnum("assignment_status")
        .notNull()
        .default("planned"),
    ...timestampColumns,
}, (table) => [
    index("hrm_development_stretch_assignment_org_plan_idx").on(table.organizationId, table.planId),
    index("hrm_development_stretch_assignment_org_status_idx").on(table.organizationId, table.assignmentStatus),
]);
/** HRM-CAR-015 — mentor per development plan. */
export const hrmDevelopmentMentorAssignments = pgTable("hrm_development_mentor_assignment", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrmDevelopmentPlans.id, { onDelete: "cascade" }),
    mentorEmployeeId: text("mentor_employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "restrict" }),
    assignmentStatus: hrDevelopmentMentorCoachStatusEnum("assignment_status")
        .notNull()
        .default("active"),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    assignedByUserId: text("assigned_by_user_id"),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hrm_development_mentor_assignment_org_plan_uidx").on(table.organizationId, table.planId),
    index("hrm_development_mentor_assignment_org_mentor_idx").on(table.organizationId, table.mentorEmployeeId),
]);
/** HRM-CAR-016 — coach per development plan. */
export const hrmDevelopmentCoachAssignments = pgTable("hrm_development_coach_assignment", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrmDevelopmentPlans.id, { onDelete: "cascade" }),
    coachEmployeeId: text("coach_employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "restrict" }),
    assignmentStatus: hrDevelopmentMentorCoachStatusEnum("assignment_status")
        .notNull()
        .default("active"),
    coachingObjective: text("coaching_objective"),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    assignedByUserId: text("assigned_by_user_id"),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hrm_development_coach_assignment_org_plan_uidx").on(table.organizationId, table.planId),
    index("hrm_development_coach_assignment_org_coach_idx").on(table.organizationId, table.coachEmployeeId),
]);
/** HRM-CAR-017 — mentor or coach session log. */
export const hrmDevelopmentSessions = pgTable("hrm_development_session", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    planId: text("plan_id")
        .notNull()
        .references(() => hrmDevelopmentPlans.id, { onDelete: "cascade" }),
    sessionKind: hrDevelopmentSessionKindEnum("session_kind").notNull(),
    mentorAssignmentId: text("mentor_assignment_id").references(() => hrmDevelopmentMentorAssignments.id, { onDelete: "set null" }),
    coachAssignmentId: text("coach_assignment_id").references(() => hrmDevelopmentCoachAssignments.id, { onDelete: "set null" }),
    sessionDate: timestamp("session_date", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes"),
    notes: text("notes"),
    actions: text("actions"),
    outcome: text("outcome"),
    loggedByUserId: text("logged_by_user_id"),
    ...timestampColumns,
}, (table) => [
    index("hrm_development_session_org_plan_idx").on(table.organizationId, table.planId),
    index("hrm_development_session_org_plan_date_idx").on(table.organizationId, table.planId, table.sessionDate),
]);
/** HRM-CAR-022 — career development discussion record. */
export const hrmCareerDiscussions = pgTable("hrm_career_discussion", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    planId: text("plan_id").references(() => hrmDevelopmentPlans.id, {
        onDelete: "set null",
    }),
    discussionDate: timestamp("discussion_date", { withTimezone: true }).notNull(),
    participants: jsonb("participants")
        .$type<readonly HrmCareerDiscussionParticipant[]>()
        .notNull()
        .default([]),
    notes: text("notes"),
    agreedActions: jsonb("agreed_actions")
        .$type<readonly HrmCareerAgreedAction[]>()
        .notNull()
        .default([]),
    nextReviewDate: timestamp("next_review_date", { withTimezone: true }),
    recordedByUserId: text("recorded_by_user_id"),
    ...timestampColumns,
}, (table) => [
    index("hrm_career_discussion_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hrm_career_discussion_org_employee_date_idx").on(table.organizationId, table.employeeId, table.discussionDate),
    index("hrm_career_discussion_org_next_review_idx").on(table.organizationId, table.nextReviewDate),
]);
/** HRM-CAR-023/024 — append-only readiness compute snapshots. */
export const hrmEmployeeReadinessSnapshots = pgTable("hrm_employee_readiness_snapshot", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    targetRoleId: text("target_role_id").references(() => hrmEmployeeTargetRoles.id, {
        onDelete: "set null",
    }),
    readinessLevel: hrEmployeeReadinessLevelEnum("readiness_level").notNull(),
    readinessScore: numeric("readiness_score", { precision: 5, scale: 2 }),
    gapSummary: jsonb("gap_summary").$type<Record<string, unknown>>(),
    snapshotNotes: text("snapshot_notes"),
    computedAt: timestamp("computed_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    computedByUserId: text("computed_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => [
    index("hrm_employee_readiness_snapshot_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hrm_employee_readiness_snapshot_org_employee_computed_idx").on(table.organizationId, table.employeeId, table.computedAt),
    index("hrm_employee_readiness_snapshot_org_level_idx").on(table.organizationId, table.readinessLevel),
]);

