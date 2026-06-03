import type { HrLmsReportGroupBy } from "./hr.talent.lms-constants.shared";
import { listHrLmsAuditTrail } from "./hr.talent.lms-audit.server";
import type { HrLmsHubPageModelInput } from "./hr.talent.lms-search-params.parse.shared";
import {
  listHrLmsAssignmentsFromStore,
  listHrLmsCoursesFromStore,
  listHrLmsProgressFromStore,
} from "./hr.talent.lms-store.shared";
import { buildHrLmsReportRows } from "./hr.talent.lms-reports.server";
import {
  buildHrLmsAdminOverviewListSurface,
  buildHrLmsAuditListSurface,
  buildHrLmsCoursesListSurface,
  buildHrLmsEmployeeOverviewListSurface,
  buildHrLmsManagerOverviewListSurface,
  buildHrLmsReportsListSurface,
} from "./hr.talent.lms-lists.surface";

const EMPLOYEE_NAMES: Record<string, string> = {
  "emp-001": "Alex Chen",
  "emp-002": "Jordan Lee",
  "emp-003": "Sam Rivera",
};

function parseReportGroupBy(value?: string): HrLmsReportGroupBy {
  const allowed: readonly HrLmsReportGroupBy[] = [
    "employee",
    "course",
    "learning_path",
    "department",
    "manager",
    "certification",
    "status",
    "provider",
    "period",
  ];
  if (value && allowed.includes(value as HrLmsReportGroupBy)) {
    return value as HrLmsReportGroupBy;
  }
  return "department";
}

export type HrLmsHubPageModel = {
  coursesList: ReturnType<typeof buildHrLmsCoursesListSurface>;
  employeeOverviewList: ReturnType<typeof buildHrLmsEmployeeOverviewListSurface>;
  managerOverviewList: ReturnType<typeof buildHrLmsManagerOverviewListSurface> | null;
  adminOverviewList: ReturnType<typeof buildHrLmsAdminOverviewListSurface> | null;
};

export type HrLmsReportsPageModel = {
  reportsList: ReturnType<typeof buildHrLmsReportsListSurface>;
  reportGroupBy: HrLmsReportGroupBy;
};

export type HrLmsAuditPageModel = {
  auditList: ReturnType<typeof buildHrLmsAuditListSurface>;
};

export async function buildHrLmsHubPageModel(
  input: HrLmsHubPageModelInput,
): Promise<HrLmsHubPageModel> {
  const courses = listHrLmsCoursesFromStore(input.organizationId);
  const progress = listHrLmsProgressFromStore(
    input.organizationId,
    input.visibleEmployeeIds,
  );
  const assignments = listHrLmsAssignmentsFromStore(input.organizationId);

  const employeeRows = progress.map((row) => {
    const course = courses.find((entry) => entry.id === row.courseId);
    return {
      id: row.id,
      courseTitle: course?.title ?? row.courseId,
      progressStatus: row.progressStatus,
      completionPercent: row.completionPercent,
    };
  });

  const managerRows = input.canViewTeam
    ? [...new Set(progress.map((row) => row.employeeId))].map((employeeId) => {
        const employeeProgress = progress.filter((row) => row.employeeId === employeeId);
        const mandatoryIncomplete = assignments.filter(
          (row) =>
            row.employeeId === employeeId &&
            row.assignmentKind === "mandatory" &&
            !employeeProgress.some(
              (entry) =>
                entry.courseId === row.courseId && entry.progressStatus === "completed",
            ),
        ).length;
        const avg =
          employeeProgress.length === 0
            ? 0
            : Math.round(
                employeeProgress.reduce((sum, row) => sum + row.completionPercent, 0) /
                  employeeProgress.length,
              );
        return {
          id: employeeId,
          employeeDisplayName: EMPLOYEE_NAMES[employeeId] ?? employeeId,
          mandatoryIncompleteCount: mandatoryIncomplete,
          completionPercent: avg,
        };
      })
    : [];

  const adminRows = input.canViewAdmin
    ? [
        {
          id: "dept-engineering",
          departmentName: "Engineering",
          completionPercent: 55,
          overdueCount: 1,
          complianceRiskCount: 1,
        },
        {
          id: "dept-operations",
          departmentName: "Operations",
          completionPercent: 20,
          overdueCount: 0,
          complianceRiskCount: 0,
        },
      ]
    : [];

  return {
    coursesList: buildHrLmsCoursesListSurface({
      rows: courses.map((row) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        category: row.category,
        courseType: row.courseType,
        courseStatus: row.courseStatus,
      })),
    }),
    employeeOverviewList: buildHrLmsEmployeeOverviewListSurface({ rows: employeeRows }),
    managerOverviewList: input.canViewTeam
      ? buildHrLmsManagerOverviewListSurface({ rows: managerRows })
      : null,
    adminOverviewList: input.canViewAdmin
      ? buildHrLmsAdminOverviewListSurface({ rows: adminRows })
      : null,
  };
}

export async function buildHrLmsReportsPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrLmsReportsPageModel> {
  const reportGroupBy = parseReportGroupBy(
    typeof input.searchParams?.lmsReportGroupBy === "string"
      ? input.searchParams.lmsReportGroupBy
      : undefined,
  );
  const rows = buildHrLmsReportRows({
    organizationId: input.organizationId,
    groupBy: reportGroupBy,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });

  return {
    reportsList: buildHrLmsReportsListSurface({ rows }),
    reportGroupBy,
  };
}

export async function buildHrLmsAuditPageModel(input: {
  organizationId: string;
}): Promise<HrLmsAuditPageModel> {
  const window = await listHrLmsAuditTrail({ organizationId: input.organizationId });
  return {
    auditList: buildHrLmsAuditListSurface({
      rows: window.rows.map((row) => ({
        id: String(row.id),
        action: String(row.action),
        summary: String(row.summary),
        occurredAt:
          row.occurredAt instanceof Date
            ? row.occurredAt.toISOString()
            : String(row.occurredAt ?? ""),
      })),
    }),
  };
}
