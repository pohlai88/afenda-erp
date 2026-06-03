import { listHrOvertimeRequestsWindow } from "@afenda/db";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import { buildHrTimeOtmReportRows } from "./hr.time.otm-report.server";
import {
  hrOtmApprovedPayrollSurfaceKey,
  hrOtmMyRequestsSurfaceKey,
  hrOtmOrgRecentSurfaceKey,
  hrOtmPayrollReadySurfaceKey,
  hrOtmPendingInboxSurfaceKey,
  hrOtmReportColumnsId,
  hrOtmReportSurfaceKey,
  hrOtmRequestsColumnsId,
} from "./hr.time.otm-surface-metadata.shared";
import type { HrTimeOtmReportGroupBy } from "./hr.time.otm.schema";
import { hrTimeOtmReadPermission } from "./hr.time.otm-route.contract";

const DEFAULT_PAGE_SIZE = 25;

function formatAmountCents(amountCents: number | null): string {
  if (amountCents === null) {
    return "—";
  }
  return String(amountCents);
}

function buildOtmRequestListSurface(input: {
  surfaceKey: string;
  headerTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  window: Awaited<ReturnType<typeof listHrOvertimeRequestsWindow>>;
  includePayrollColumns?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeOtmReadPermission,
    presentation: {
      primaryColumnId: "employee",
    },
    pagination: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: { title: input.headerTitle },
      columnsId: hrOtmRequestsColumnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: input.emptyTitle,
        description: input.emptyDescription,
      },
    },
    columns: [
      { id: "employee", header: "Employee", priority: "primary", pin: "start" },
      { id: "workDate", header: "Work date" },
      { id: "hours", header: "Hours" },
      ...(input.includePayrollColumns
        ? [
            { id: "payable", header: "Payable min" },
            { id: "amount", header: "Amount (¢)" },
            { id: "earning", header: "Earning code" },
          ]
        : []),
      { id: "type", header: "Type" },
      { id: "status", header: "Status" },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.employeeDisplayName}`,
        workDate: row.workDate.toISOString().slice(0, 10),
        hours: row.hours,
        ...(input.includePayrollColumns
          ? {
              payable:
                row.payableMinutes === null ? "—" : String(row.payableMinutes),
              amount: formatAmountCents(row.amountCents),
              earning: row.earningCode ?? "—",
            }
          : {}),
        type: row.overtimeType,
        status: row.statusLabel,
      },
    })),
  });
}

export async function buildHrTimeOtmPageModel(input: {
  organizationId: string;
  search?: string;
  reportGroupBy?: HrTimeOtmReportGroupBy;
  visibleEmployeeIds?: readonly string[] | null;
}) {
  const [
    pendingWindow,
    orgRecentWindow,
    myRequestsWindow,
    approvedPayrollWindow,
    payrollReadyWindow,
    reportRows,
  ] = await Promise.all([
    listHrOvertimeRequestsWindow({
      organizationId: input.organizationId,
      search: input.search,
      pendingOnly: true,
      limit: DEFAULT_PAGE_SIZE,
      visibleEmployeeIds: input.visibleEmployeeIds,
    }),
    listHrOvertimeRequestsWindow({
      organizationId: input.organizationId,
      search: input.search,
      limit: DEFAULT_PAGE_SIZE,
      visibleEmployeeIds: input.visibleEmployeeIds,
    }),
    listHrOvertimeRequestsWindow({
      organizationId: input.organizationId,
      search: input.search,
      limit: DEFAULT_PAGE_SIZE,
      visibleEmployeeIds: input.visibleEmployeeIds,
    }),
    listHrOvertimeRequestsWindow({
      organizationId: input.organizationId,
      search: input.search,
      status: "approved",
      limit: DEFAULT_PAGE_SIZE,
      visibleEmployeeIds: input.visibleEmployeeIds,
    }),
    listHrOvertimeRequestsWindow({
      organizationId: input.organizationId,
      search: input.search,
      status: "payroll_ready",
      limit: DEFAULT_PAGE_SIZE,
      visibleEmployeeIds: input.visibleEmployeeIds,
    }),
    buildHrTimeOtmReportRows({
      organizationId: input.organizationId,
      groupBy: input.reportGroupBy ?? "department",
      visibleEmployeeIds: input.visibleEmployeeIds,
    }),
  ]);

  return {
    pendingInboxSurfaceKey: hrOtmPendingInboxSurfaceKey,
    orgRecentSurfaceKey: hrOtmOrgRecentSurfaceKey,
    myRequestsSurfaceKey: hrOtmMyRequestsSurfaceKey,
    approvedPayrollSurfaceKey: hrOtmApprovedPayrollSurfaceKey,
    payrollReadySurfaceKey: hrOtmPayrollReadySurfaceKey,
    reportSurfaceKey: hrOtmReportSurfaceKey,
    pendingInboxSurface: buildOtmRequestListSurface({
      surfaceKey: hrOtmPendingInboxSurfaceKey,
      headerTitle: "Pending overtime approvals",
      emptyTitle: "No pending overtime",
      emptyDescription: "Submitted overtime requests appear here for approval.",
      window: pendingWindow,
    }),
    orgRecentSurface: buildOtmRequestListSurface({
      surfaceKey: hrOtmOrgRecentSurfaceKey,
      headerTitle: "Recent overtime requests",
      emptyTitle: "No overtime requests",
      emptyDescription: "Org-scoped overtime requests appear here.",
      window: orgRecentWindow,
    }),
    myRequestsSurface: buildOtmRequestListSurface({
      surfaceKey: hrOtmMyRequestsSurfaceKey,
      headerTitle: "My overtime requests",
      emptyTitle: "No overtime requests",
      emptyDescription: "Your draft and submitted overtime requests appear here.",
      window: myRequestsWindow,
    }),
    approvedPayrollSurface: buildOtmRequestListSurface({
      surfaceKey: hrOtmApprovedPayrollSurfaceKey,
      headerTitle: "Approved for payroll",
      emptyTitle: "No approved overtime",
      emptyDescription:
        "Approved overtime with payable hours and amount appears here before payroll-ready marking.",
      window: approvedPayrollWindow,
      includePayrollColumns: true,
    }),
    payrollReadySurface: buildOtmRequestListSurface({
      surfaceKey: hrOtmPayrollReadySurfaceKey,
      headerTitle: "Payroll-ready overtime",
      emptyTitle: "No payroll-ready overtime",
      emptyDescription:
        "Overtime marked payroll-ready is available for payroll export and period lock.",
      window: payrollReadyWindow,
      includePayrollColumns: true,
    }),
    reportSurface: buildGovernedListSurface({
      __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
      dataNature: "table",
      presentationProfile: "erp-operational-table",
      requiresErpPermission: hrTimeOtmReadPermission,
      presentation: {
        primaryColumnId: "group",
      },
      pagination: {
        pageSize: reportRows.length,
        totalCount: reportRows.length,
        hasNextPage: false,
      },
      surface: {
        header: { title: "Overtime report" },
        columnsId: hrOtmReportColumnsId,
        rowKey: "id",
        empty: {
          variant: "muted",
          title: "No overtime data",
          description:
            "Adjust filters or submit overtime requests to populate this report.",
        },
      },
      columns: [
        { id: "group", header: "Group", priority: "primary", pin: "start" },
        { id: "period", header: "Period" },
        { id: "requests", header: "Requests" },
        { id: "hours", header: "Total hours" },
        { id: "payable", header: "Payable minutes" },
        { id: "amount", header: "Amount (cents)" },
      ],
      rows: reportRows.map((row) => ({
        id: `${row.groupKey}:${row.periodLabel ?? "all"}`,
        cells: {
          group: row.groupLabel,
          period: row.periodLabel ?? "—",
          requests: String(row.requestCount),
          hours: String(row.totalHours),
          payable: String(row.payableMinutes),
          amount: String(row.amountCents),
        },
      })),
    }),
    searchValue: input.search ?? "",
    reportGroupBy: input.reportGroupBy ?? "department",
    pendingCount: pendingWindow.totalCount,
    orgRecentCount: orgRecentWindow.totalCount,
    myRequestsCount: myRequestsWindow.totalCount,
  };
}
