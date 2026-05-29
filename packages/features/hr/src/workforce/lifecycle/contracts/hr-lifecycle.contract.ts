import type { HrEmploymentStatus } from "../../employees/contracts/hr-employee.contract";

export const HR_PROBATION_OUTCOMES = [
  "confirmed",
  "extended",
  "termination_recommended",
] as const;

export type HrProbationOutcome = (typeof HR_PROBATION_OUTCOMES)[number];

export const HR_MOVEMENT_KINDS = [
  "promotion",
  "transfer",
  "demotion",
  "department_change",
  "manager_change",
] as const;

export type HrMovementKind = (typeof HR_MOVEMENT_KINDS)[number];

export type HrLifecycleOverviewRow = {
  id: string;
  employeeNumber: string;
  displayName: string;
  employmentStatus: HrEmploymentStatus;
  stage: HrEmploymentStatus | "archived";
  probationEndDate: Date | null;
  confirmationDate: Date | null;
  pendingTransitionCount: number;
  nextEffectiveDate: Date | null;
};

export type HrLifecycleOverviewWindow = {
  rows: readonly HrLifecycleOverviewRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};
