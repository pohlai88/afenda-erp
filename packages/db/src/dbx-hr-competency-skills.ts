import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, } from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { hrDepartments, hrEmployees, hrPositions } from "./dbx-hr";
import { organizations } from "./dbx-organizations";
const organizationReference = () => organizationIdColumn().references(() => organizations.id, {
    onDelete: "cascade",
});
/** CSF-003 — competency library categories. */
export const hrCsfCompetencyCategoryEnum = pgEnum("hr_csf_competency_category", [
    "core",
    "leadership",
    "technical",
    "behavioral",
    "functional",
    "safety",
    "compliance",
]);
/** CSF-004 — skill library categories. */
export const hrCsfSkillCategoryEnum = pgEnum("hr_csf_skill_category", [
    "job_family",
    "department",
    "function",
    "role",
    "capability_domain",
]);
export const hrCsfLibraryStatusEnum = pgEnum("hr_csf_library_status", [
    "draft",
    "active",
    "inactive",
    "archived",
]);
/** CSF-007/008 — requirement mapping scope dimensions. */
export const hrCsfRequirementScopeEnum = pgEnum("hr_csf_requirement_scope", [
    "job_role",
    "job_family",
    "grade",
    "position",
    "department",
    "legal_entity",
]);
/** CSF-009 — required skill classification. */
export const hrCsfSkillRequirementClassEnum = pgEnum("hr_csf_skill_requirement_class", ["mandatory", "preferred", "critical", "optional"]);
/** CSF-005/006 — reusable proficiency scale definitions. */
export const hrCsfProficiencyScales = pgTable("hr_csf_proficiency_scales", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    scaleStatus: hrCsfLibraryStatusEnum("scale_status")
        .notNull()
        .default("draft"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_proficiency_scales_org_code_uidx").on(table.organizationId, table.code),
    index("hr_csf_proficiency_scales_org_status_idx").on(table.organizationId, table.scaleStatus),
]);
/** CSF-005/006 — proficiency level rows with descriptions and assessment criteria. */
export const hrCsfProficiencyLevels = pgTable("hr_csf_proficiency_levels", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    scaleId: text("scale_id")
        .notNull()
        .references(() => hrCsfProficiencyScales.id, { onDelete: "cascade" }),
    levelOrder: integer("level_order").notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    assessmentCriteria: text("assessment_criteria").notNull(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_proficiency_levels_org_scale_order_uidx").on(table.organizationId, table.scaleId, table.levelOrder),
    uniqueIndex("hr_csf_proficiency_levels_org_scale_code_uidx").on(table.organizationId, table.scaleId, table.code),
    index("hr_csf_proficiency_levels_org_scale_idx").on(table.organizationId, table.scaleId),
]);
/** CSF-001/003 — competency library entries. */
export const hrCsfCompetencies = pgTable("hr_csf_competencies", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    category: hrCsfCompetencyCategoryEnum("category").notNull(),
    description: text("description"),
    libraryStatus: hrCsfLibraryStatusEnum("library_status")
        .notNull()
        .default("draft"),
    proficiencyScaleId: text("proficiency_scale_id")
        .notNull()
        .references(() => hrCsfProficiencyScales.id, { onDelete: "restrict" }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_competencies_org_code_uidx").on(table.organizationId, table.code),
    index("hr_csf_competencies_org_category_idx").on(table.organizationId, table.category),
    index("hr_csf_competencies_org_status_idx").on(table.organizationId, table.libraryStatus),
]);
/** CSF-002/004 — skill library entries. */
export const hrCsfSkills = pgTable("hr_csf_skills", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    category: hrCsfSkillCategoryEnum("category").notNull(),
    description: text("description"),
    libraryStatus: hrCsfLibraryStatusEnum("library_status")
        .notNull()
        .default("draft"),
    proficiencyScaleId: text("proficiency_scale_id")
        .notNull()
        .references(() => hrCsfProficiencyScales.id, { onDelete: "restrict" }),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_skills_org_code_uidx").on(table.organizationId, table.code),
    index("hr_csf_skills_org_category_idx").on(table.organizationId, table.category),
    index("hr_csf_skills_org_status_idx").on(table.organizationId, table.libraryStatus),
]);
/** CSF-007/010 — required competency mappings by organizational scope. */
export const hrCsfCompetencyRequirements = pgTable("hr_csf_competency_requirements", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    competencyId: text("competency_id")
        .notNull()
        .references(() => hrCsfCompetencies.id, { onDelete: "cascade" }),
    scope: hrCsfRequirementScopeEnum("scope").notNull(),
    scopeRef: text("scope_ref").notNull(),
    jobRole: text("job_role"),
    jobFamily: text("job_family"),
    grade: text("grade"),
    positionId: text("position_id").references(() => hrPositions.id, {
        onDelete: "set null",
    }),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    legalEntityCode: text("legal_entity_code"),
    requiredProficiencyLevelId: text("required_proficiency_level_id")
        .notNull()
        .references(() => hrCsfProficiencyLevels.id, { onDelete: "restrict" }),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_competency_req_org_comp_scope_uidx").on(table.organizationId, table.competencyId, table.scope, table.scopeRef),
    index("hr_csf_competency_req_org_scope_idx").on(table.organizationId, table.scope, table.scopeRef),
]);
/** CSF-008/009/010 — required skill mappings by organizational scope. */
export const hrCsfSkillRequirements = pgTable("hr_csf_skill_requirements", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    skillId: text("skill_id")
        .notNull()
        .references(() => hrCsfSkills.id, { onDelete: "cascade" }),
    scope: hrCsfRequirementScopeEnum("scope").notNull(),
    scopeRef: text("scope_ref").notNull(),
    jobRole: text("job_role"),
    jobFamily: text("job_family"),
    grade: text("grade"),
    positionId: text("position_id").references(() => hrPositions.id, {
        onDelete: "set null",
    }),
    departmentId: text("department_id").references(() => hrDepartments.id, {
        onDelete: "set null",
    }),
    legalEntityCode: text("legal_entity_code"),
    requirementClass: hrCsfSkillRequirementClassEnum("requirement_class")
        .notNull()
        .default("mandatory"),
    requiredProficiencyLevelId: text("required_proficiency_level_id")
        .notNull()
        .references(() => hrCsfProficiencyLevels.id, { onDelete: "restrict" }),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_skill_req_org_skill_scope_uidx").on(table.organizationId, table.skillId, table.scope, table.scopeRef),
    index("hr_csf_skill_req_org_scope_idx").on(table.organizationId, table.scope, table.scopeRef),
    index("hr_csf_skill_req_org_class_idx").on(table.organizationId, table.requirementClass),
]);
/** CSF-014..016 — assessment actor types. */
export const hrCsfAssessmentTypeEnum = pgEnum("hr_csf_assessment_type", [
    "self",
    "manager",
    "hr_validation",
]);
/** CSF-011..013 — profile target kind. */
export const hrCsfAssessmentTargetEnum = pgEnum("hr_csf_assessment_target", [
    "competency",
    "skill",
]);
export const hrCsfAssessmentStatusEnum = pgEnum("hr_csf_assessment_status", [
    "draft",
    "submitted",
    "validated",
    "superseded",
]);
export const hrCsfProfileStatusEnum = pgEnum("hr_csf_profile_status", [
    "active",
    "inactive",
]);
/** CSF-011/013 — employee competency profile with current proficiency. */
export const hrCsfEmployeeCompetencyProfiles = pgTable("hr_csf_employee_competency_profiles", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    competencyId: text("competency_id")
        .notNull()
        .references(() => hrCsfCompetencies.id, { onDelete: "cascade" }),
    currentProficiencyLevelId: text("current_proficiency_level_id").references(() => hrCsfProficiencyLevels.id, { onDelete: "set null" }),
    selfAssessmentEnabled: boolean("self_assessment_enabled")
        .notNull()
        .default(true),
    hrValidationRequired: boolean("hr_validation_required")
        .notNull()
        .default(false),
    profileStatus: hrCsfProfileStatusEnum("profile_status")
        .notNull()
        .default("active"),
    lastAssessedAt: timestamp("last_assessed_at", { withTimezone: true }),
    lastAssessmentId: text("last_assessment_id"),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_emp_comp_profiles_org_emp_comp_uidx").on(table.organizationId, table.employeeId, table.competencyId),
    index("hr_csf_emp_comp_profiles_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_csf_emp_comp_profiles_org_competency_idx").on(table.organizationId, table.competencyId),
]);
/** CSF-012/013 — employee skill profile with current proficiency. */
export const hrCsfEmployeeSkillProfiles = pgTable("hr_csf_employee_skill_profiles", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
        .notNull()
        .references(() => hrCsfSkills.id, { onDelete: "cascade" }),
    currentProficiencyLevelId: text("current_proficiency_level_id").references(() => hrCsfProficiencyLevels.id, { onDelete: "set null" }),
    selfAssessmentEnabled: boolean("self_assessment_enabled")
        .notNull()
        .default(true),
    hrValidationRequired: boolean("hr_validation_required")
        .notNull()
        .default(false),
    profileStatus: hrCsfProfileStatusEnum("profile_status")
        .notNull()
        .default("active"),
    lastAssessedAt: timestamp("last_assessed_at", { withTimezone: true }),
    lastAssessmentId: text("last_assessment_id"),
    notes: text("notes"),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_emp_skill_profiles_org_emp_skill_uidx").on(table.organizationId, table.employeeId, table.skillId),
    index("hr_csf_emp_skill_profiles_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_csf_emp_skill_profiles_org_skill_idx").on(table.organizationId, table.skillId),
]);
/** CSF-014..016 — competency/skill assessments. */
export const hrCsfAssessments = pgTable("hr_csf_assessments", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    assessmentType: hrCsfAssessmentTypeEnum("assessment_type").notNull(),
    targetType: hrCsfAssessmentTargetEnum("target_type").notNull(),
    competencyProfileId: text("competency_profile_id").references(() => hrCsfEmployeeCompetencyProfiles.id, { onDelete: "set null" }),
    skillProfileId: text("skill_profile_id").references(() => hrCsfEmployeeSkillProfiles.id, { onDelete: "set null" }),
    competencyId: text("competency_id").references(() => hrCsfCompetencies.id, {
        onDelete: "set null",
    }),
    skillId: text("skill_id").references(() => hrCsfSkills.id, {
        onDelete: "set null",
    }),
    proficiencyLevelId: text("proficiency_level_id")
        .notNull()
        .references(() => hrCsfProficiencyLevels.id, { onDelete: "restrict" }),
    assessorUserId: text("assessor_user_id").notNull(),
    assessorEmployeeId: text("assessor_employee_id").references(() => hrEmployees.id, { onDelete: "set null" }),
    assessmentDate: timestamp("assessment_date", { withTimezone: true }).notNull(),
    confidenceLevel: integer("confidence_level").notNull().default(3),
    assessmentStatus: hrCsfAssessmentStatusEnum("assessment_status")
        .notNull()
        .default("submitted"),
    notes: text("notes"),
    validatedByUserId: text("validated_by_user_id"),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    supersedesAssessmentId: text("supersedes_assessment_id"),
    ...timestampColumns,
}, (table) => [
    index("hr_csf_assessments_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_csf_assessments_org_type_idx").on(table.organizationId, table.assessmentType),
    index("hr_csf_assessments_org_comp_profile_idx").on(table.organizationId, table.competencyProfileId),
    index("hr_csf_assessments_org_skill_profile_idx").on(table.organizationId, table.skillProfileId),
]);
/** CSF-017 — assessment evidence rows. */
export const hrCsfAssessmentEvidence = pgTable("hr_csf_assessment_evidence", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    assessmentId: text("assessment_id")
        .notNull()
        .references(() => hrCsfAssessments.id, { onDelete: "cascade" }),
    evidenceSummary: text("evidence_summary").notNull(),
    source: text("source").notNull(),
    evidenceDate: timestamp("evidence_date", { withTimezone: true }).notNull(),
    assessorUserId: text("assessor_user_id").notNull(),
    confidenceLevel: integer("confidence_level").notNull().default(3),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestampColumns,
}, (table) => [
    index("hr_csf_assessment_evidence_org_assessment_idx").on(table.organizationId, table.assessmentId),
]);
/** CSF-018/019 — skill vs competency gap records. */
export const hrCsfGapKindEnum = pgEnum("hr_csf_gap_kind", [
    "skill",
    "competency",
]);
export const hrCsfGapStatusEnum = pgEnum("hr_csf_gap_status", [
    "open",
    "closed",
    "superseded",
]);
/** CSF-020 — gap classification dimensions. */
export const hrCsfGapSeverityEnum = pgEnum("hr_csf_gap_severity", [
    "none",
    "low",
    "moderate",
    "high",
    "critical",
]);
export const hrCsfGapPriorityEnum = pgEnum("hr_csf_gap_priority", [
    "low",
    "medium",
    "high",
    "urgent",
]);
export const hrCsfRoleImpactEnum = pgEnum("hr_csf_role_impact", [
    "minimal",
    "moderate",
    "significant",
    "critical",
]);
export const hrCsfDevelopmentUrgencyEnum = pgEnum("hr_csf_development_urgency", [
    "deferred",
    "planned",
    "soon",
    "immediate",
]);
/** CSF-021 — development action kinds. */
export const hrCsfDevelopmentActionTypeEnum = pgEnum("hr_csf_development_action_type", [
    "training",
    "coaching",
    "mentoring",
    "certification",
    "stretch_assignment",
    "self_study",
    "peer_learning",
]);
export const hrCsfDevelopmentRecommendationStatusEnum = pgEnum("hr_csf_development_recommendation_status", ["recommended", "accepted", "in_progress", "completed", "dismissed"]);
/** CSF-022 — linkage target kinds. */
export const hrCsfDevelopmentLinkTypeEnum = pgEnum("hr_csf_development_link_type", [
    "course",
    "learning_path",
    "certification",
    "coaching",
    "development_plan",
]);
/** CSF-018/019 — persisted proficiency gap analysis rows. */
export const hrCsfGaps = pgTable("hr_csf_gaps", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    employeeId: text("employee_id")
        .notNull()
        .references(() => hrEmployees.id, { onDelete: "cascade" }),
    gapKind: hrCsfGapKindEnum("gap_kind").notNull(),
    skillId: text("skill_id").references(() => hrCsfSkills.id, {
        onDelete: "cascade",
    }),
    competencyId: text("competency_id").references(() => hrCsfCompetencies.id, {
        onDelete: "cascade",
    }),
    requirementId: text("requirement_id").notNull(),
    requirementClass: hrCsfSkillRequirementClassEnum("requirement_class"),
    requiredProficiencyLevelId: text("required_proficiency_level_id")
        .notNull()
        .references(() => hrCsfProficiencyLevels.id, { onDelete: "restrict" }),
    currentProficiencyLevelId: text("current_proficiency_level_id").references(() => hrCsfProficiencyLevels.id, { onDelete: "set null" }),
    requiredLevelOrder: integer("required_level_order").notNull(),
    currentLevelOrder: integer("current_level_order").notNull().default(0),
    gapSize: integer("gap_size").notNull().default(0),
    hasGap: boolean("has_gap").notNull().default(false),
    gapStatus: hrCsfGapStatusEnum("gap_status").notNull().default("open"),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_gaps_org_employee_req_uidx").on(table.organizationId, table.employeeId, table.gapKind, table.requirementId),
    index("hr_csf_gaps_org_employee_idx").on(table.organizationId, table.employeeId),
    index("hr_csf_gaps_org_skill_idx").on(table.organizationId, table.skillId),
    index("hr_csf_gaps_org_competency_idx").on(table.organizationId, table.competencyId),
    index("hr_csf_gaps_org_status_idx").on(table.organizationId, table.gapStatus),
]);
/** CSF-020 — severity, priority, role impact, and development urgency. */
export const hrCsfGapClassifications = pgTable("hr_csf_gap_classifications", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    gapId: text("gap_id")
        .notNull()
        .references(() => hrCsfGaps.id, { onDelete: "cascade" }),
    severity: hrCsfGapSeverityEnum("severity").notNull(),
    priority: hrCsfGapPriorityEnum("priority").notNull(),
    roleImpact: hrCsfRoleImpactEnum("role_impact").notNull(),
    developmentUrgency: hrCsfDevelopmentUrgencyEnum("development_urgency").notNull(),
    rationale: text("rationale"),
    classifiedAt: timestamp("classified_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    uniqueIndex("hr_csf_gap_classifications_org_gap_uidx").on(table.organizationId, table.gapId),
    index("hr_csf_gap_classifications_org_severity_idx").on(table.organizationId, table.severity),
    index("hr_csf_gap_classifications_org_priority_idx").on(table.organizationId, table.priority),
]);
/** CSF-021 — recommended development actions from gap analysis. */
export const hrCsfDevelopmentRecommendations = pgTable("hr_csf_development_recommendations", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    gapId: text("gap_id")
        .notNull()
        .references(() => hrCsfGaps.id, { onDelete: "cascade" }),
    actionType: hrCsfDevelopmentActionTypeEnum("action_type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    priority: hrCsfGapPriorityEnum("priority").notNull(),
    recommendationStatus: hrCsfDevelopmentRecommendationStatusEnum("recommendation_status")
        .notNull()
        .default("recommended"),
    recommendedAt: timestamp("recommended_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_csf_dev_recs_org_gap_idx").on(table.organizationId, table.gapId),
    index("hr_csf_dev_recs_org_status_idx").on(table.organizationId, table.recommendationStatus),
    index("hr_csf_dev_recs_org_action_idx").on(table.organizationId, table.actionType),
]);
/** CSF-022 — links recommendations to courses, paths, certifications, coaching, plans. */
export const hrCsfDevelopmentLinks = pgTable("hr_csf_development_links", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    recommendationId: text("recommendation_id")
        .notNull()
        .references(() => hrCsfDevelopmentRecommendations.id, {
        onDelete: "cascade",
    }),
    linkType: hrCsfDevelopmentLinkTypeEnum("link_type").notNull(),
    externalRef: text("external_ref").notNull(),
    title: text("title"),
    url: text("url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestampColumns,
}, (table) => [
    index("hr_csf_dev_links_org_rec_idx").on(table.organizationId, table.recommendationId),
    index("hr_csf_dev_links_org_type_idx").on(table.organizationId, table.linkType),
    uniqueIndex("hr_csf_dev_links_org_rec_ref_uidx").on(table.organizationId, table.recommendationId, table.linkType, table.externalRef),
]);
/** CSF-031 foundation — setup, mapping, and library audit trail. */
export const hrCsfAuditEvents = pgTable("hr_csf_audit_events", {
    id: text("id").primaryKey(),
    organizationId: organizationReference(),
    competencyId: text("competency_id").references(() => hrCsfCompetencies.id, {
        onDelete: "set null",
    }),
    skillId: text("skill_id").references(() => hrCsfSkills.id, {
        onDelete: "set null",
    }),
    proficiencyScaleId: text("proficiency_scale_id").references(() => hrCsfProficiencyScales.id, { onDelete: "set null" }),
    requirementId: text("requirement_id"),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ...timestampColumns,
}, (table) => [
    index("hr_csf_audit_events_org_occurred_idx").on(table.organizationId, table.occurredAt),
    index("hr_csf_audit_events_org_competency_idx").on(table.organizationId, table.competencyId),
    index("hr_csf_audit_events_org_skill_idx").on(table.organizationId, table.skillId),
]);


