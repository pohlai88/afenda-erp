import {
  buildHrSuiteListSurfaceColumnsByKey,
  buildHrSuiteListSurfaceKeys,
  buildHrSuiteReadOnlyListSurfaceKeys,
  buildHrSuiteSearchParamModelFields,
  buildHrSuiteSearchParamsBySurfaceKey,
  defineHrSuiteListSurfaceRegistry,
  type HrSuiteListSurfaceProfile,
} from "../../employee-management/compliance-regulatory-tracking/metadata";

export const hrTrainingOverviewKpiSurfaceKey =
  "hr.talent.training-development.overview.kpi" as const;
export const hrTrainingCoursesSurfaceKey =
  "hr.talent.training-development.courses.list" as const;
export const hrTrainingProvidersSurfaceKey =
  "hr.talent.training-development.providers.list" as const;
export const hrTrainingRequirementsSurfaceKey =
  "hr.talent.training-development.requirements.list" as const;
export const hrTrainingAssignmentsSurfaceKey =
  "hr.talent.training-development.assignments.list" as const;
export const hrTrainingEnrollmentsSurfaceKey =
  "hr.talent.training-development.enrollments-waitlist.list" as const;
export const hrTrainingAttendanceSurfaceKey =
  "hr.talent.training-development.attendance.list" as const;
export const hrTrainingCompletionsSurfaceKey =
  "hr.talent.training-development.completions.list" as const;
export const hrTrainingAssessmentsSurfaceKey =
  "hr.talent.training-development.assessments.list" as const;
export const hrTrainingSkillsSurfaceKey =
  "hr.talent.training-development.skills.list" as const;
export const hrTrainingCompetenciesSurfaceKey =
  "hr.talent.training-development.competencies.list" as const;
export const hrTrainingSkillGapsSurfaceKey =
  "hr.talent.training-development.skill-gaps.list" as const;
export const hrTrainingDevelopmentPlansSurfaceKey =
  "hr.talent.training-development.development-plans.list" as const;
export const hrTrainingCertificationsSurfaceKey =
  "hr.talent.training-development.certifications.list" as const;
export const hrTrainingAlertsSurfaceKey =
  "hr.talent.training-development.certification-alerts.list" as const;
export const hrTrainingFeedbackSurfaceKey =
  "hr.talent.training-development.feedback-evaluation.list" as const;
export const hrTrainingCostsSurfaceKey =
  "hr.talent.training-development.costs.list" as const;
export const hrTrainingComplianceSurfaceKey =
  "hr.talent.training-development.compliance-export.list" as const;
export const hrTrainingReadinessSurfaceKey =
  "hr.talent.training-development.readiness-export.list" as const;
export const hrTrainingBoardingSurfaceKey =
  "hr.talent.training-development.boarding-bridge.list" as const;
export const hrTrainingReportsSurfaceKey =
  "hr.talent.training-development.reports.list" as const;
export const hrTrainingAuditTrailSurfaceKey =
  "hr.talent.training-development.audit-trail.list" as const;

export const HR_TALENT_TRAINING_LIST_SURFACE_REGISTRY =
  defineHrSuiteListSurfaceRegistry([
    {
      surfaceKey: hrTrainingCoursesSurfaceKey,
      param: "trainingCoursesSearch",
      modelField: "coursesSearch",
      label: "Search courses",
      placeholder: "Search courses",
      columns: [
        { id: "code", header: "Code", priority: "primary" },
        { id: "title", header: "Course", priority: "secondary" },
        { id: "trainingType", header: "Type" },
        { id: "deliveryMode", header: "Delivery" },
        { id: "capacity", header: "Capacity" },
        { id: "cost", header: "Cost" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrTrainingProvidersSurfaceKey,
      param: "trainingProvidersSearch",
      modelField: "providersSearch",
      label: "Search providers",
      placeholder: "Search providers",
      columns: [
        { id: "name", header: "Provider", priority: "primary" },
        { id: "providerType", header: "Type" },
        { id: "contactName", header: "Contact" },
        { id: "accreditationRef", header: "Accreditation" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrTrainingRequirementsSurfaceKey,
      param: "trainingRequirementsSearch",
      modelField: "requirementsSearch",
      label: "Search requirements",
      placeholder: "Search mandatory requirements",
      columns: [
        { id: "courseCode", header: "Course", priority: "primary" },
        { id: "scope", header: "Scope" },
        { id: "mandatory", header: "Mandatory" },
        { id: "recurrence", header: "Recurrence" },
        { id: "dueWithinDays", header: "Due window" },
      ],
    },
    {
      surfaceKey: hrTrainingAssignmentsSurfaceKey,
      param: "trainingAssignmentsSearch",
      modelField: "assignmentsSearch",
      label: "Search assignments",
      placeholder: "Search assignments",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "courseCode", header: "Course" },
        { id: "departmentName", header: "Department" },
        { id: "assignmentSource", header: "Source" },
        { id: "dueAt", header: "Due" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrTrainingEnrollmentsSurfaceKey,
      param: "trainingEnrollmentsSearch",
      modelField: "enrollmentsSearch",
      label: "Search enrollments",
      placeholder: "Search enrollments and waitlist",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "courseCode", header: "Course" },
        { id: "status", header: "Status" },
        { id: "approvalRequired", header: "Approval" },
        { id: "approvedByUserId", header: "Approver" },
        { id: "waitlistPosition", header: "Waitlist" },
      ],
    },
    {
      surfaceKey: hrTrainingAttendanceSurfaceKey,
      param: "trainingAttendanceSearch",
      modelField: "attendanceSearch",
      label: "Search attendance",
      placeholder: "Search attendance",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "courseCode", header: "Course" },
        { id: "sessionDate", header: "Session" },
        { id: "status", header: "Status" },
        { id: "recordedByUserId", header: "Recorded by" },
      ],
    },
    {
      surfaceKey: hrTrainingCompletionsSurfaceKey,
      param: "trainingCompletionsSearch",
      modelField: "completionsSearch",
      label: "Search completions",
      placeholder: "Search completions",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "courseCode", header: "Course" },
        { id: "status", header: "Status" },
        { id: "completedAt", header: "Completed" },
        { id: "expiresAt", header: "Expires" },
        { id: "lmsCompletionRef", header: "LMS ref" },
      ],
    },
    {
      surfaceKey: hrTrainingAssessmentsSurfaceKey,
      param: "trainingAssessmentsSearch",
      modelField: "assessmentsSearch",
      label: "Search assessments",
      placeholder: "Search assessments",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "courseCode", header: "Course" },
        { id: "assessmentDate", header: "Date" },
        { id: "score", header: "Score" },
        { id: "passingScore", header: "Pass score" },
        { id: "result", header: "Result" },
      ],
    },
    {
      surfaceKey: hrTrainingSkillsSurfaceKey,
      param: "trainingSkillsSearch",
      modelField: "skillsSearch",
      label: "Search skills",
      placeholder: "Search employee skills",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "skillName", header: "Skill" },
        { id: "skillCategory", header: "Category" },
        { id: "proficiencyLevel", header: "Proficiency" },
        { id: "evidenceRef", header: "Evidence" },
        { id: "lastAssessedAt", header: "Assessed" },
      ],
    },
    {
      surfaceKey: hrTrainingCompetenciesSurfaceKey,
      param: "trainingCompetenciesSearch",
      modelField: "competenciesSearch",
      label: "Search competencies",
      placeholder: "Search role competencies",
      columns: [
        { id: "name", header: "Competency", priority: "primary" },
        { id: "category", header: "Category" },
        { id: "requiredLevel", header: "Required" },
        { id: "roleTitle", header: "Role" },
        { id: "departmentName", header: "Department" },
        { id: "grade", header: "Grade" },
      ],
    },
    {
      surfaceKey: hrTrainingSkillGapsSurfaceKey,
      param: "trainingSkillGapsSearch",
      modelField: "skillGapsSearch",
      label: "Search skill gaps",
      placeholder: "Search skill gaps",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "competencyName", header: "Competency" },
        { id: "requiredLevel", header: "Required" },
        { id: "currentLevel", header: "Current" },
        { id: "severity", header: "Severity" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrTrainingDevelopmentPlansSurfaceKey,
      param: "trainingDevelopmentPlansSearch",
      modelField: "developmentPlansSearch",
      label: "Search development plans",
      placeholder: "Search development plans",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "title", header: "Plan" },
        { id: "source", header: "Source" },
        { id: "targetDate", header: "Target" },
        { id: "progressPercent", header: "Progress" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrTrainingCertificationsSurfaceKey,
      param: "trainingCertificationsSearch",
      modelField: "certificationsSearch",
      label: "Search certifications",
      placeholder: "Search certifications",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "certificationName", header: "Certification" },
        { id: "issuingBody", header: "Issuing body" },
        { id: "expiryDate", header: "Expiry" },
        { id: "documentEvidenceRef", header: "Evidence" },
        { id: "status", header: "Status" },
      ],
    },
    {
      surfaceKey: hrTrainingAlertsSurfaceKey,
      param: "trainingAlertsSearch",
      modelField: "alertsSearch",
      label: "Search alerts",
      placeholder: "Search expiry and missing alerts",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "audience", header: "Audience" },
        { id: "alertAt", header: "Alert date" },
        { id: "severity", header: "Severity" },
        { id: "status", header: "Status" },
        { id: "message", header: "Message" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTrainingFeedbackSurfaceKey,
      param: "trainingFeedbackSearch",
      modelField: "feedbackSearch",
      label: "Search feedback",
      placeholder: "Search course feedback",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "courseCode", header: "Course" },
        { id: "submittedAt", header: "Submitted" },
        { id: "rating", header: "Rating" },
        { id: "comments", header: "Comments" },
      ],
    },
    {
      surfaceKey: hrTrainingCostsSurfaceKey,
      param: "trainingCostsSearch",
      modelField: "costsSearch",
      label: "Search costs",
      placeholder: "Search training costs",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "courseCode", header: "Course" },
        { id: "departmentName", header: "Department" },
        { id: "providerName", header: "Provider" },
        { id: "period", header: "Period" },
        { id: "amount", header: "Amount" },
      ],
    },
    {
      surfaceKey: hrTrainingComplianceSurfaceKey,
      param: "trainingComplianceSearch",
      modelField: "complianceSearch",
      label: "Search compliance exports",
      placeholder: "Search compliance completion refs",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "courseCode", header: "Course" },
        { id: "requirementRef", header: "Requirement" },
        { id: "completionStatus", header: "Status" },
        { id: "expiresAt", header: "Expires" },
        { id: "sourceSystem", header: "Source" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTrainingReadinessSurfaceKey,
      param: "trainingReadinessSearch",
      modelField: "readinessSearch",
      label: "Search readiness exports",
      placeholder: "Search skill and certification readiness",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "consumer", header: "Consumer" },
        { id: "readinessSignal", header: "Signal" },
        { id: "certificationStatus", header: "Certification" },
        { id: "openSkillGapCount", header: "Open gaps" },
        { id: "authorizedAt", header: "Authorized" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTrainingBoardingSurfaceKey,
      param: "trainingBoardingSearch",
      modelField: "boardingSearch",
      label: "Search boarding bridge",
      placeholder: "Search boarding task completion refs",
      columns: [
        { id: "employeeDisplayName", header: "Employee", priority: "primary" },
        { id: "trainingCourseCode", header: "Course" },
        { id: "onboardingTaskRef", header: "Task" },
        { id: "completionStatus", header: "Status" },
        { id: "completedAt", header: "Completed" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTrainingReportsSurfaceKey,
      param: "trainingReportsSearch",
      modelField: "reportsSearch",
      label: "Search reports",
      placeholder: "Search report rows",
      columns: [
        { id: "groupLabel", header: "Group", priority: "primary" },
        { id: "assignedCount", header: "Assigned" },
        { id: "completedCount", header: "Completed" },
        { id: "overdueCount", header: "Overdue" },
        { id: "complianceRate", header: "Compliance" },
        { id: "costAmount", header: "Cost" },
      ],
      readOnly: true,
    },
    {
      surfaceKey: hrTrainingAuditTrailSurfaceKey,
      param: "trainingAuditTrailSearch",
      modelField: "auditTrailSearch",
      label: "Search audit trail",
      placeholder: "Search audit events",
      columns: [
        { id: "summary", header: "Summary", priority: "primary" },
        { id: "action", header: "Action" },
        { id: "actorId", header: "Actor" },
        { id: "targetType", header: "Target" },
        { id: "occurredAt", header: "Occurred" },
      ],
      readOnly: true,
    },
  ] as const);

export const HR_TRAINING_LIST_SURFACE_KEYS = buildHrSuiteListSurfaceKeys(
  HR_TALENT_TRAINING_LIST_SURFACE_REGISTRY,
);
export const HR_TALENT_TRAINING_LIST_SURFACE_KEYS =
  HR_TRAINING_LIST_SURFACE_KEYS;

export type HrTrainingListSurfaceKey =
  (typeof HR_TRAINING_LIST_SURFACE_KEYS)[number];
export type HrTalentTrainingListSurfaceKey = HrTrainingListSurfaceKey;

export const HR_TRAINING_READ_ONLY_LIST_SURFACE_KEYS =
  buildHrSuiteReadOnlyListSurfaceKeys(HR_TALENT_TRAINING_LIST_SURFACE_REGISTRY);
export const HR_TALENT_TRAINING_READ_ONLY_LIST_SURFACE_KEYS =
  HR_TRAINING_READ_ONLY_LIST_SURFACE_KEYS;

export const HR_TRAINING_LIST_SEARCH_PARAMS_BY_KEY =
  buildHrSuiteSearchParamsBySurfaceKey(
    HR_TALENT_TRAINING_LIST_SURFACE_REGISTRY,
  );
export const HR_TALENT_TRAINING_LIST_SEARCH_PARAMS_BY_KEY =
  HR_TRAINING_LIST_SEARCH_PARAMS_BY_KEY;

export const HR_TRAINING_LIST_SEARCH_PARAM_MODEL_FIELDS =
  buildHrSuiteSearchParamModelFields(
    HR_TALENT_TRAINING_LIST_SURFACE_REGISTRY,
  );
export const HR_TALENT_TRAINING_LIST_SEARCH_PARAM_MODEL_FIELDS =
  HR_TRAINING_LIST_SEARCH_PARAM_MODEL_FIELDS;

export const HR_TRAINING_LIST_SURFACE_COLUMNS_BY_KEY =
  buildHrSuiteListSurfaceColumnsByKey(
    HR_TALENT_TRAINING_LIST_SURFACE_REGISTRY,
  );
export const HR_TALENT_TRAINING_LIST_SURFACE_COLUMNS_BY_KEY =
  HR_TRAINING_LIST_SURFACE_COLUMNS_BY_KEY;

export const HR_TRAINING_LIST_SURFACE_PROFILE_BY_KEY = {
  [hrTrainingCoursesSurfaceKey]: "erp-operational-table",
  [hrTrainingProvidersSurfaceKey]: "erp-operational-table",
  [hrTrainingRequirementsSurfaceKey]: "erp-operational-table",
  [hrTrainingAssignmentsSurfaceKey]: "erp-operational-table",
  [hrTrainingEnrollmentsSurfaceKey]: "erp-exception-table",
  [hrTrainingAttendanceSurfaceKey]: "erp-operational-table",
  [hrTrainingCompletionsSurfaceKey]: "erp-operational-table",
  [hrTrainingAssessmentsSurfaceKey]: "erp-operational-table",
  [hrTrainingSkillsSurfaceKey]: "erp-operational-table",
  [hrTrainingCompetenciesSurfaceKey]: "erp-operational-table",
  [hrTrainingSkillGapsSurfaceKey]: "erp-exception-table",
  [hrTrainingDevelopmentPlansSurfaceKey]: "erp-exception-table",
  [hrTrainingCertificationsSurfaceKey]: "erp-exception-table",
  [hrTrainingAlertsSurfaceKey]: "erp-exception-table",
  [hrTrainingFeedbackSurfaceKey]: "erp-operational-table",
  [hrTrainingCostsSurfaceKey]: "erp-analytical-table",
  [hrTrainingComplianceSurfaceKey]: "erp-analytical-table",
  [hrTrainingReadinessSurfaceKey]: "erp-analytical-table",
  [hrTrainingBoardingSurfaceKey]: "erp-analytical-table",
  [hrTrainingReportsSurfaceKey]: "erp-analytical-table",
  [hrTrainingAuditTrailSurfaceKey]: "erp-audit-ledger",
} as const satisfies Record<HrTrainingListSurfaceKey, HrSuiteListSurfaceProfile>;

export function getHrTrainingListSurfaceKeys(): readonly HrTrainingListSurfaceKey[] {
  return HR_TRAINING_LIST_SURFACE_KEYS;
}

export const getHrTalentTrainingListSurfaceKeys =
  getHrTrainingListSurfaceKeys;

export const hrTalentTrainingWorkbenchSurfaceKey = hrTrainingCoursesSurfaceKey;
