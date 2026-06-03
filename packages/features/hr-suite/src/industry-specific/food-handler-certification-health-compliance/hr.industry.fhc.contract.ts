import { defineHrSuiteReadPermission } from "../../../hr-suite-integration";
import type {
  HrFhcDutyRestrictionReason,
  HrFhcEligibilityStatus,
  HrFhcTrainingStatus,
  HrFhcTrainingType,
} from "./hr.industry.fhc-constants.shared";

export const hrIndustryFhcReadPermission =
  defineHrSuiteReadPermission("industry.fhc");

export type HrIndustryFhcListCellValue = string | number | boolean | null;

export type HrIndustryFhcListRow = {
  readonly id: string;
  readonly cells: Record<string, HrIndustryFhcListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrFhcShiftSchedulingEligibilityRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly outletId: string;
  readonly outletName: string;
  readonly roleName: string;
  readonly eligibilityStatus: HrFhcEligibilityStatus;
  readonly dutyRestrictionRef?: string;
  readonly restrictionReason?: HrFhcDutyRestrictionReason;
};

export type HrFhcComplianceTrainingRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly trainingType: HrFhcTrainingType;
  readonly status: HrFhcTrainingStatus;
  readonly dueDate: string;
  readonly completedAt?: string;
  readonly requirementRef: string;
};

export type HrFhcLearningRequirementRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly trainingType: HrFhcTrainingType;
  readonly dueDate: string;
  readonly requirementRef: string;
  readonly renewalRequired: boolean;
};
