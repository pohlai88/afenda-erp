import { defineHrSuiteReadPermission } from "../../../hr-suite-integration";

export const hrWorkforceEssReadPermission =
  defineHrSuiteReadPermission("workforce.ess");

export type HrWorkforceEssListCellValue = string | number | boolean | null;

export type HrWorkforceEssListRow = {
  readonly id: string;
  readonly cells: Record<string, HrWorkforceEssListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrWorkforceEssAuditTargetType =
  | "profile"
  | "profile_update"
  | "leave_request"
  | "pay_document"
  | "attendance"
  | "schedule"
  | "claim"
  | "document"
  | "resource"
  | "acknowledgement"
  | "task"
  | "approval"
  | "notification"
  | "benefit"
  | "training"
  | "onboarding"
  | "offboarding"
  | "consent"
  | "access_log";

export type HrWorkforceEssIntegrationExposure = {
  readonly ref: string;
  readonly targetType:
    | "profile_update"
    | "leave_request"
    | "claim"
    | "task"
    | "document";
  readonly targetId: string;
  readonly summary: string;
  readonly exposedAt: string;
};
