import type { HrCareerPathingAuditEventRecord } from "./hr.talent.career-pathing-audit-store.shared";

export type HrCareerPathingAuditTrailWindow = {
  rows: HrCareerPathingAuditEventRecord[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function formatCareerPathingAuditActionLabel(action: string): string {
  return action
    .replace(/^hr\.talent\.career_path\./, "")
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" · ");
}
