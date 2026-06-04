import { defineHrSuiteReadPermission } from "../../hr-suite-integration";

export const hrTalentRssReadPermission =
  defineHrSuiteReadPermission("talent.rss");

export type HrTalentRssListCellValue = string | number | boolean | null;

export type HrTalentRssListRow = {
  readonly id: string;
  readonly cells: Record<string, HrTalentRssListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrTalentRssAuditTargetType =
  | "candidate_profile"
  | "job_posting"
  | "application"
  | "document"
  | "interview"
  | "assessment"
  | "form"
  | "offer"
  | "requisition_request"
  | "candidate_review"
  | "scorecard"
  | "approval"
  | "role_task"
  | "notification"
  | "privacy"
  | "retention"
  | "account";

export type HrTalentRssIntegrationExposure = {
  readonly ref: string;
  readonly targetType: HrTalentRssAuditTargetType;
  readonly targetId: string;
  readonly summary: string;
  readonly exposedAt: string;
};
