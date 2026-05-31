import type {
  HrCareerReportGroupBy,
  HrCareerReportKind,
} from "../schemas/hr.talent.career-pathing-constants.shared";

/** HRM-CAR-029 — exportable career pathing report kinds. */
export const HR_CAREER_PATHING_REPORT_KINDS = [
  "readiness",
  "development",
  "milestones",
] as const satisfies readonly HrCareerReportKind[];

export type HrCareerPathingReportKind = (typeof HR_CAREER_PATHING_REPORT_KINDS)[number];

export type HrCareerPathingReportCsvResult = {
  content: string;
  mimeType: "text/csv;charset=utf-8";
  fileExtension: "csv";
  encoding: "utf8";
  rowCount: number;
  reportKind: HrCareerPathingReportKind;
  groupBy: HrCareerReportGroupBy;
};

export type HrCareerPathingReportRow = {
  id: string;
  groupKey: string;
  groupLabel: string;
  employeeCount: number;
  planCount: number;
  nearReadyCount: number;
  overdueMilestoneCount: number;
  completedGoalCount: number;
};

export type HrCareerPathingReportFilter = {
  departmentName?: string | null;
  jobFamily?: string | null;
  targetRoleTitle?: string | null;
  readinessLevel?: string | null;
  planStatus?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
};
