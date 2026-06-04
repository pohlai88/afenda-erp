import { defineHrSuiteReadPermission } from "../../hr-suite-integration";

export const hrTalentEngReadPermission =
  defineHrSuiteReadPermission("talent.eng");

export type HrTalentEngListCellValue = string | number | boolean | null;

export type HrTalentEngListRow = {
  readonly id: string;
  readonly cells: Record<string, HrTalentEngListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrTalentEngAuditTargetType =
  | "template"
  | "survey"
  | "invitation_batch"
  | "response"
  | "analytics"
  | "report"
  | "comment"
  | "improvement_action"
  | "notification";

export type HrTalentEngIntegrationExposure = {
  readonly ref: string;
  readonly targetType:
    | "survey"
    | "analytics"
    | "report"
    | "improvement_action";
  readonly targetId: string;
  readonly summary: string;
  readonly exposedAt: string;
};
