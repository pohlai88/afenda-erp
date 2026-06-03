import type { HrCareerReadinessLevel } from "./hr.talent.career-pathing-constants.shared";

/** HRM-CAR-026 — development plan reference for Performance Appraisals. */
export type HrCareerDevelopmentPlanAppraisalRef = {
  organizationId: string;
  employeeId: string;
  planId: string;
  planCode: string;
  planTitle: string;
  planStatus: string;
  goalCount: number;
  completedGoalCount: number;
  targetCompletionDate: string | null;
};

/** HRM-CAR-027 — readiness indicator for Succession Planning. */
export type HrCareerSuccessionReadinessRef = {
  organizationId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  targetRoleId: string | null;
  targetRoleTitle: string | null;
  readinessLevel: HrCareerReadinessLevel;
  readinessScore: string | null;
  computedAt: string;
};

/** HRM-CAR-028 — learning recommendation for Training & LMS. */
export type HrCareerDevelopmentLearningRef = {
  organizationId: string;
  employeeId: string;
  learningActionId: string;
  planId: string;
  planCode: string;
  title: string;
  trainingCourseId: string | null;
  externalTrainingRef: string | null;
  learningActionStatus: string;
  dueDate: string | null;
};

export type HrCareerPathingIntegrationQuery = {
  organizationId: string;
  employeeId?: string;
  employeeIds?: readonly string[];
  performanceAuthorized?: boolean;
  successionAuthorized?: boolean;
  includeCompletedLearning?: boolean;
  readinessLevels?: readonly HrCareerReadinessLevel[];
  limit?: number;
};
