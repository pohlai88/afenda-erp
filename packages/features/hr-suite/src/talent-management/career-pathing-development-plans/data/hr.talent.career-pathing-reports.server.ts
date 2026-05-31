import {
  countOverdueHrmDevelopmentMilestones,
  listHrmDevelopmentPlansWindow,
  listHrmEmployeeReadinessSnapshotsWindow,
  listHrmEmployeeTargetRolesWindow,
} from "@afenda/db";

import type { HrCareerReportGroupBy } from "../schemas/hr.talent.career-pathing-constants.shared";
import type {
  HrCareerPathingReportFilter,
  HrCareerPathingReportRow,
} from "./hr.talent.career-pathing.reports.shared";
import { formatCareerReadinessLevelLabel } from "./hr.talent.career-pathing-readiness.shared";

function groupLabelFor(
  groupBy: HrCareerReportGroupBy,
  row: {
    employeeName: string;
    managerName: string;
    departmentName: string;
    jobFamily: string;
    targetRoleTitle: string;
    readinessLevel: string;
    planStatus: string;
    periodLabel: string;
  },
): { key: string; label: string } {
  switch (groupBy) {
    case "employee":
      return { key: row.employeeName, label: row.employeeName };
    case "manager":
      return { key: row.managerName, label: row.managerName };
    case "department":
      return { key: row.departmentName, label: row.departmentName };
    case "job_family":
      return { key: row.jobFamily, label: row.jobFamily };
    case "target_role":
      return { key: row.targetRoleTitle, label: row.targetRoleTitle };
    case "readiness":
      return {
        key: row.readinessLevel,
        label: formatCareerReadinessLevelLabel(
          row.readinessLevel as Parameters<typeof formatCareerReadinessLevelLabel>[0],
        ),
      };
    case "status":
      return { key: row.planStatus, label: row.planStatus };
    case "period":
      return { key: row.periodLabel, label: row.periodLabel };
    default:
      return { key: "unknown", label: "Unknown" };
  }
}

/** HRM-CAR-029 — career and development report aggregation. */
export async function buildHrCareerPathingReportRows(input: {
  organizationId: string;
  groupBy: HrCareerReportGroupBy;
  filter?: HrCareerPathingReportFilter;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrCareerPathingReportRow[]> {
  const [plansWindow, readinessWindow, targetRolesWindow, overdueCount] =
    await Promise.all([
      listHrmDevelopmentPlansWindow({
        organizationId: input.organizationId,
        limit: 500,
      }),
      listHrmEmployeeReadinessSnapshotsWindow({
        organizationId: input.organizationId,
        limit: 500,
      }),
      listHrmEmployeeTargetRolesWindow({
        organizationId: input.organizationId,
        limit: 500,
      }),
      countOverdueHrmDevelopmentMilestones({
        organizationId: input.organizationId,
      }),
    ]);

  const readinessByEmployee = new Map(
    readinessWindow.rows.map((row) => [row.employeeId, row.readinessLevel]),
  );
  const targetRoleByEmployee = new Map(
    targetRolesWindow.rows.map((row) => [
      row.employeeId,
      {
        targetRoleTitle: row.targetRoleTitle ?? "Unassigned",
        jobFamily: row.jobFamily ?? "Unassigned",
        departmentName: row.departmentId ?? "Unassigned",
      },
    ]),
  );

  const sourceRows = plansWindow.rows
    .filter((plan) => {
      if (
        input.visibleEmployeeIds &&
        !input.visibleEmployeeIds.includes(plan.employeeId)
      ) {
        return false;
      }
      const target = targetRoleByEmployee.get(plan.employeeId);
      if (input.filter?.departmentName && target?.departmentName !== input.filter.departmentName) {
        return false;
      }
      if (input.filter?.jobFamily && target?.jobFamily !== input.filter.jobFamily) {
        return false;
      }
      if (
        input.filter?.targetRoleTitle &&
        target?.targetRoleTitle !== input.filter.targetRoleTitle
      ) {
        return false;
      }
      if (input.filter?.planStatus && plan.planStatus !== input.filter.planStatus) {
        return false;
      }
      const readinessLevel = readinessByEmployee.get(plan.employeeId) ?? "not_ready";
      if (input.filter?.readinessLevel && readinessLevel !== input.filter.readinessLevel) {
        return false;
      }
      return true;
    })
    .map((plan) => {
      const target = targetRoleByEmployee.get(plan.employeeId);
      const readinessLevel = readinessByEmployee.get(plan.employeeId) ?? "not_ready";
      return {
        employeeId: plan.employeeId,
        employeeName: plan.employeeName,
        managerName: "Unassigned",
        departmentName: target?.departmentName ?? "Unassigned",
        jobFamily: target?.jobFamily ?? "Unassigned",
        targetRoleTitle: target?.targetRoleTitle ?? "Unassigned",
        readinessLevel,
        planStatus: plan.planStatus,
        periodLabel: (plan.targetCompletionDate ?? plan.startDate ?? new Date())
          .toISOString()
          .slice(0, 7),
        planId: plan.id,
      };
    });

  const grouped = new Map<string, HrCareerPathingReportRow>();

  for (const row of sourceRows) {
    const { key, label } = groupLabelFor(input.groupBy, row);
    const current = grouped.get(key) ?? {
      id: key,
      groupKey: key,
      groupLabel: label,
      employeeCount: 0,
      planCount: 0,
      nearReadyCount: 0,
      overdueMilestoneCount: 0,
      completedGoalCount: 0,
    };

    const employees = new Set(
      sourceRows.filter((r) => groupLabelFor(input.groupBy, r).key === key).map((r) => r.employeeId),
    );

    grouped.set(key, {
      ...current,
      employeeCount: employees.size,
      planCount: current.planCount + 1,
      nearReadyCount:
        current.nearReadyCount +
        (["near_ready", "ready", "role_ready"].includes(row.readinessLevel) ? 1 : 0),
      overdueMilestoneCount: overdueCount,
      completedGoalCount: current.completedGoalCount,
    });
  }

  return [...grouped.values()];
}

export function buildHrCareerPathingReportCsvContent(
  rows: readonly HrCareerPathingReportRow[],
  groupBy: HrCareerReportGroupBy,
): string {
  const header = [
    "group_key",
    "group_label",
    "employee_count",
    "plan_count",
    "near_ready_count",
    "overdue_milestone_count",
    "completed_goal_count",
    "group_by",
  ].join(",");

  const body = rows.map((row) =>
    [
      csvEscape(row.groupKey),
      csvEscape(row.groupLabel),
      String(row.employeeCount),
      String(row.planCount),
      String(row.nearReadyCount),
      String(row.overdueMilestoneCount),
      String(row.completedGoalCount),
      csvEscape(groupBy),
    ].join(","),
  );

  return [header, ...body].join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
