import { defineHrSuiteReadPermission } from "../../../hr-suite-integration";
import type {
  HrRwsBudgetStatus,
  HrRwsCoverageStatus,
  HrRwsIntegrationTarget,
  HrRwsOpenShiftStatus,
  HrRwsSwapStatus,
} from "./hr.industry.rws-constants.shared";

export const hrIndustryRwsReadPermission =
  defineHrSuiteReadPermission("industry.rws");

export type HrIndustryRwsListCellValue = string | number | boolean | null;

export type HrIndustryRwsListRow = {
  readonly id: string;
  readonly cells: Record<string, HrIndustryRwsListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrRwsOpenShiftEligibilityReference = {
  readonly id: string;
  readonly openShiftId: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly status: HrRwsOpenShiftStatus;
  readonly eligibilityFlags: readonly string[];
};

export type HrRwsCoverageGapReference = {
  readonly id: string;
  readonly storeName: string;
  readonly departmentName: string;
  readonly roleName: string;
  readonly coverageDate: string;
  readonly hourWindow: string;
  readonly requiredCount: number;
  readonly scheduledCount: number;
  readonly status: HrRwsCoverageStatus;
};

export type HrRwsAttendanceOutcomeReference = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly scheduleId: string;
  readonly scheduledHours: number;
  readonly actualHours: number;
  readonly varianceHours: number;
  readonly attendanceOutcomeRef: string;
};

export type HrRwsPayrollScheduleReferenceExport = {
  readonly id: string;
  readonly scheduleId: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly scheduledHours: number;
  readonly actualHoursRef?: string;
  readonly shiftPremiumRef?: string;
  readonly holidayWorkRef?: string;
  readonly attendanceOutcomeRef: string;
  readonly budgetStatus: HrRwsBudgetStatus;
};

export type HrRwsSwapWorkflowReference = {
  readonly id: string;
  readonly requesterEmployeeId: string;
  readonly replacementEmployeeId: string;
  readonly status: HrRwsSwapStatus;
  readonly approvalWorkflowRef?: string;
  readonly decisionReason?: string;
};

export type HrRwsIntegrationExposureReference = {
  readonly id: string;
  readonly integrationTarget: HrRwsIntegrationTarget;
  readonly sourceRef: string;
  readonly summary: string;
  readonly employeeId?: string;
  readonly status: "ready" | "exposed" | "blocked";
};
