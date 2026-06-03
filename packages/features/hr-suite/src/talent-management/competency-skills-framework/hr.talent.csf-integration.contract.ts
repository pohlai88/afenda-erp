import type {
  HrCsfGapSeverity,
  HrCsfProficiencyLevel,
  HrCsfSkillRequirementKind,
} from "./hr.talent.csf-constants.shared";

/** HRM-CSF-023 — gap exposure payload for Training & Development. */
export type HrCsfTrainingDevelopmentGapExposure = {
  organizationId: string;
  employeeId: string;
  employeeDisplayName: string;
  gapId: string;
  gapKind: "skill" | "competency";
  itemCode: string;
  itemName: string;
  requiredLevel: HrCsfProficiencyLevel;
  currentLevel: HrCsfProficiencyLevel;
  severity: HrCsfGapSeverity;
  developmentPriority: string;
  recommendedActions: readonly string[];
};

/** HRM-CSF-024 — learning recommendation payload for LMS. */
export type HrCsfLmsLearningRecommendation = {
  organizationId: string;
  employeeId: string;
  gapId: string;
  courseCode: string;
  courseTitle: string;
  learningPathCode?: string;
  proficiencyTarget: HrCsfProficiencyLevel;
  enabled: boolean;
};

/** HRM-CSF-025 — competency reference for Performance Appraisals (authorized). */
export type HrCsfPerformanceAppraisalCompetencyRef = {
  organizationId: string;
  employeeId: string;
  competencyCode: string;
  competencyName: string;
  requiredLevel: HrCsfProficiencyLevel;
  assessedLevel: HrCsfProficiencyLevel;
  lastAssessedAt: string;
  assessorKind: "self" | "manager" | "hr" | "expert";
  evidenceSummary?: string;
};

/** HRM-CSF-026 — readiness indicator for Succession Planning (authorized). */
export type HrCsfSuccessionReadinessIndicator = {
  organizationId: string;
  employeeId: string;
  employeeDisplayName: string;
  targetRoleCode: string;
  targetRoleName: string;
  readinessScorePct: number;
  criticalGapCount: number;
  leadershipPipelineEligible: boolean;
  skillCoveragePct: number;
  competencyCoveragePct: number;
};

/** HRM-CSF-027 — career path skill requirement comparison row. */
export type HrCsfCareerPathSkillComparison = {
  skillCode: string;
  skillName: string;
  requirementKind: HrCsfSkillRequirementKind;
  currentLevel: HrCsfProficiencyLevel | null;
  targetLevel: HrCsfProficiencyLevel;
  gapLevels: number;
  meetsRequirement: boolean;
};

/** HRM-CSF-028 — employee skill match result. */
export type HrCsfEmployeeSkillMatch = {
  employeeId: string;
  employeeDisplayName: string;
  employeeNumber: string;
  departmentName: string;
  matchScorePct: number;
  matchedSkillCount: number;
  requiredSkillCount: number;
  missingCriticalSkills: readonly string[];
};

/** Downstream module ports — implement when linked. */
export interface HrCsfTrainingDevelopmentPort {
  publishGapExposure(
    rows: readonly HrCsfTrainingDevelopmentGapExposure[],
  ): Promise<{ publishedCount: number }>;
}

export interface HrCsfLmsPort {
  publishLearningRecommendations(
    rows: readonly HrCsfLmsLearningRecommendation[],
  ): Promise<{ publishedCount: number }>;
}

export interface HrCsfPerformanceAppraisalsPort {
  publishCompetencyReferences(
    rows: readonly HrCsfPerformanceAppraisalCompetencyRef[],
  ): Promise<{ publishedCount: number }>;
}

export interface HrCsfSuccessionPlanningPort {
  publishReadinessIndicators(
    rows: readonly HrCsfSuccessionReadinessIndicator[],
  ): Promise<{ publishedCount: number }>;
}

export type HrCsfIntegrationPorts = {
  trainingDevelopment: HrCsfTrainingDevelopmentPort;
  lms: HrCsfLmsPort;
  performanceAppraisals: HrCsfPerformanceAppraisalsPort;
  successionPlanning: HrCsfSuccessionPlanningPort;
};

export type HrCsfIntegrationExposureQuery = {
  organizationId: string;
  employeeIds?: readonly string[] | null;
  lmsEnabled?: boolean;
  performanceAuthorized?: boolean;
  successionAuthorized?: boolean;
};
