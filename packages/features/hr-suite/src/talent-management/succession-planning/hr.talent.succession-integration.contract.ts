import type {
  HrSuccessionReadinessLevel,
  HrSuccessionRecommendationMovementType,
  HrSuccessionRiskLevel,
} from "./hr.talent.succession-constants.shared";

export type HrSuccessionLifecycleRecommendationRef = {
  organizationId: string;
  recommendationId: string;
  criticalRoleId: string;
  successorNominationId: string;
  employeeId: string;
  employeeDisplayName: string;
  targetRoleTitle: string;
  movementType: HrSuccessionRecommendationMovementType;
  readinessLevel: HrSuccessionReadinessLevel;
  approvalReference: string;
  approvedAt: string;
};

export type HrSuccessionRiskExposureRef = {
  organizationId: string;
  criticalRoleId: string;
  roleTitle: string;
  departmentId: string;
  departmentName: string;
  riskLevel: HrSuccessionRiskLevel;
  noReadySuccessor: boolean;
  weakCoverage: boolean;
};

export type HrSuccessionIntegrationQuery = {
  organizationId: string;
  lifecycleAuthorized?: boolean;
  riskAuthorized?: boolean;
  limit?: number;
};
