import { defineHrSuiteReadPermission } from "../../hr-suite-integration";
import type {
  HrGpgAssignmentValidationStatus,
  HrGpgGradeMovementType,
  HrGpgIntegrationTarget,
  HrGpgStepEligibilityStatus,
} from "./hr.industry.gpg-constants.shared";

export const hrIndustryGpgReadPermission =
  defineHrSuiteReadPermission("industry.gpg");

export type HrIndustryGpgListCellValue = string | number | boolean | null;

export type HrIndustryGpgListRow = {
  readonly id: string;
  readonly cells: Record<string, HrIndustryGpgListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrGpgPayrollReferenceExport = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly positionId: string;
  readonly classificationCode: string;
  readonly gradeCode: string;
  readonly stepCode: string;
  readonly salaryTableCode: string;
  readonly localityArea: string;
  readonly localityAdjustedPay: number;
  readonly effectiveFrom: string;
  readonly validationStatus: HrGpgAssignmentValidationStatus;
};

export type HrGpgLifecycleMovementReference = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly movementType: HrGpgGradeMovementType;
  readonly fromGradeCode: string;
  readonly toGradeCode: string;
  readonly effectiveDate: string;
  readonly lifecycleRef?: string;
};

export type HrGpgStepIncreaseEligibilityReference = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly gradeCode: string;
  readonly currentStepCode: string;
  readonly nextStepCode: string;
  readonly eligibilityDate: string;
  readonly eligibilityStatus: HrGpgStepEligibilityStatus;
};

export type HrGpgIntegrationExposureReference = {
  readonly id: string;
  readonly integrationTarget: HrGpgIntegrationTarget;
  readonly sourceRef: string;
  readonly approvedReference: string;
  readonly status: "ready" | "exposed" | "blocked";
  readonly exposedAt: string;
};
