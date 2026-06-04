import { defineHrSuiteReadPermission } from "../../hr-suite-integration";

export const hrTalentTrainingReadPermission =
  defineHrSuiteReadPermission("talent.training");

export const hrTrainingReadPermission = hrTalentTrainingReadPermission;

export type HrTrainingListCellValue = string | number | boolean | null;

export type HrTrainingListRow = {
  readonly id: string;
  readonly cells: Record<string, HrTrainingListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrTrainingComplianceCompletionRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly courseCode: string;
  readonly requirementRef: string;
  readonly completionStatus: string;
  readonly completedAt?: string;
  readonly expiresAt?: string;
  readonly sourceSystem: "training" | "lms" | "blended";
};

export type HrTrainingReadinessRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly consumer: "performance" | "lifecycle";
  readonly readinessSignal: string;
  readonly certificationStatus: string;
  readonly openSkillGapCount: number;
  readonly authorizedAt: string;
};

export type HrTrainingBoardingCompletionRef = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly trainingCourseCode: string;
  readonly onboardingTaskRef: string;
  readonly completionStatus: string;
  readonly completedAt?: string;
};
