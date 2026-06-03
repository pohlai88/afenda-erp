import { defineHrSuiteReadPermission } from "../../../hr-suite-integration";
import type {
  HrMscEligibilityStatus,
  HrMscIntegrationTarget,
  HrMscTrainingStatus,
  HrMscTrainingType,
  HrMscWorkRestrictionReason,
} from "./hr.industry.msc-constants.shared";

export const hrIndustryMscReadPermission =
  defineHrSuiteReadPermission("industry.msc");

export type HrIndustryMscListCellValue = string | number | boolean | null;

export type HrIndustryMscListRow = {
  readonly id: string;
  readonly cells: Record<string, HrIndustryMscListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrMscComplianceTrainingCompletionRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly trainingType: HrMscTrainingType;
  readonly status: HrMscTrainingStatus;
  readonly dueDate: string;
  readonly completedAt?: string;
  readonly requirementRef: string;
  readonly evidenceDocumentRef?: string;
};

export type HrMscLearningRequirementRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly trainingType: HrMscTrainingType;
  readonly dueDate: string;
  readonly requirementRef: string;
  readonly renewalRequired: boolean;
};

export type HrMscShiftSchedulingEligibilityRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly siteName: string;
  readonly roleName: string;
  readonly eligibilityStatus: HrMscEligibilityStatus;
  readonly restrictionRefs: readonly string[];
  readonly restrictionReason?: HrMscWorkRestrictionReason;
};

export type HrMscDocumentEvidenceRef = {
  readonly id: string;
  readonly targetRef: string;
  readonly documentManagementRef: string;
  readonly evidenceType: string;
  readonly employeeId?: string;
};

export type HrMscIntegrationExposureRef = {
  readonly id: string;
  readonly integrationTarget: HrMscIntegrationTarget;
  readonly sourceRef: string;
  readonly status: string;
  readonly exposedAt: string;
  readonly summary: string;
};
