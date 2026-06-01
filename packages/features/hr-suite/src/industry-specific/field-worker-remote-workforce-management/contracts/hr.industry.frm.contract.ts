import { defineHrSuiteReadPermission } from "../../../hr-suite-integration";

export const hrIndustryFrmReadPermission =
  defineHrSuiteReadPermission("industry.frm");

export type HrIndustryFrmListCellValue = string | number | boolean | null;

export type HrIndustryFrmListRow = {
  readonly id: string;
  readonly cells: Record<string, HrIndustryFrmListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrFrmAttendanceOutcomeRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly assignmentId: string;
  readonly workDate: string;
  readonly outcome: "validated" | "exception" | "offline_reconciled";
  readonly gpsValidationRef: string;
  readonly leaveAttendanceRef: string;
};

export type HrFrmOvertimeWorkHourRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly assignmentId: string;
  readonly workDate: string;
  readonly actualHours: number;
  readonly overtimeEligible: boolean;
};

export type HrFrmPayrollReference = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly sourceRef: string;
  readonly referenceType: "field_attendance" | "per_diem" | "travel_allowance";
  readonly amount?: number;
  readonly currency?: string;
  readonly payrollPeriod: string;
};
