import {
  calculateOtmPayableForApproval,
  deriveOtmDayCategoryFromType,
  getHrOvertimePolicy,
  listHrOvertimeRateRules,
  listHrOvertimeRequestsWindow,
  type HrOvertimeRequestRow,
} from "@afenda/db";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

import { hrOtmAttendanceReconcileColumnsId } from "./hr.time.otm-surface-metadata.shared";
import { hrTimeOtmReadPermission } from "./hr.time.otm-route.contract";

export type HrTimeOtmAttendanceReconcileRow = {
  id: string;
  employeeLabel: string;
  workDate: string;
  requestedMinutes: number;
  attendanceMinutes: number | null;
  varianceMinutes: number | null;
  payableMinutes: number;
  hasMismatch: boolean;
};

/** HRM-OTM-010 — attendance reconcile rows when compareAttendanceEnabled (AC 9). */
export async function buildHrTimeOtmAttendanceReconcileRows(input: {
  organizationId: string;
  policyGroupCode?: string;
  attendanceByRequestId?: Readonly<
    Record<string, { overtimeMinutes?: number | null }>
  >;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<readonly HrTimeOtmAttendanceReconcileRow[]> {
  const policy = await getHrOvertimePolicy({
    organizationId: input.organizationId,
    policyGroupCode: input.policyGroupCode,
  });

  if (!policy.compareAttendanceEnabled) {
    return [];
  }

  const window = await listHrOvertimeRequestsWindow({
    organizationId: input.organizationId,
    statuses: ["submitted", "pending", "approved", "payroll_ready"],
    limit: 50,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });

  const rateRules = await listHrOvertimeRateRules({
    organizationId: input.organizationId,
    policyGroupCode: input.policyGroupCode,
  });

  return window.rows.map((row) =>
    mapReconcileRow(row, policy, rateRules, input.attendanceByRequestId?.[row.id]),
  );
}

function mapReconcileRow(
  row: HrOvertimeRequestRow,
  policy: Awaited<ReturnType<typeof getHrOvertimePolicy>>,
  rateRules: Awaited<ReturnType<typeof listHrOvertimeRateRules>>,
  attendance?: { overtimeMinutes?: number | null },
): HrTimeOtmAttendanceReconcileRow {
  const dayCategory =
    deriveOtmDayCategoryFromType(row.overtimeType);

  const result = calculateOtmPayableForApproval({
    policy,
    rateRules,
    rateContext: {
      overtimeType: row.overtimeType,
      dayCategory,
      shiftCategory: null,
      employeeCategory: null,
      countryCode: null,
      asOf: row.workDate,
    },
    periodUsage: { dailyMinutes: 0, weeklyMinutes: 0, monthlyMinutes: 0 },
    hours: row.hours,
    startTime: row.startTime,
    endTime: row.endTime,
    attendanceOvertimeMinutes: attendance?.overtimeMinutes ?? null,
  });

  const variance =
    result.attendanceMinutes != null
      ? Math.abs(result.requestedMinutes - result.attendanceMinutes)
      : null;

  return {
    id: row.id,
    employeeLabel: `${row.employeeNumber} · ${row.employeeDisplayName}`,
    workDate: row.workDate.toISOString().slice(0, 10),
    requestedMinutes: result.requestedMinutes,
    attendanceMinutes: result.attendanceMinutes,
    varianceMinutes: variance,
    payableMinutes: result.payableMinutes,
    hasMismatch: result.exceptions.some((e) => e.kind === "attendance_mismatch"),
  };
}

export async function buildHrTimeOtmAttendanceReconcileListSurface(input: {
  organizationId: string;
  policyGroupCode?: string;
  surfaceKey: string;
  attendanceByRequestId?: Readonly<
    Record<string, { overtimeMinutes?: number | null }>
  >;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<ListSurfaceRendererConfigurationResolvedInput> {
  const rows = await buildHrTimeOtmAttendanceReconcileRows(input);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrTimeOtmReadPermission,
    presentation: {
      primaryColumnId: "employee",
    },
    pagination: {
      pageSize: rows.length,
      totalCount: rows.length,
      hasNextPage: false,
    },
    surface: {
      header: { title: "Attendance reconcile" },
      columnsId: hrOtmAttendanceReconcileColumnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "Attendance compare disabled",
        description:
          "Enable compareAttendanceEnabled on the overtime policy to reconcile requests against clock records.",
      },
    },
    columns: [
      { id: "employee", header: "Employee", priority: "primary", pin: "start" },
      { id: "workDate", header: "Work date" },
      { id: "requested", header: "Requested (m)" },
      { id: "attendance", header: "Attendance (m)" },
      { id: "variance", header: "Variance (m)" },
      { id: "payable", header: "Payable (m)" },
      { id: "status", header: "Status" },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        employee: row.employeeLabel,
        workDate: row.workDate,
        requested: String(row.requestedMinutes),
        attendance:
          row.attendanceMinutes != null ? String(row.attendanceMinutes) : "—",
        variance: row.varianceMinutes != null ? String(row.varianceMinutes) : "—",
        payable: String(row.payableMinutes),
        status: row.hasMismatch ? "Mismatch" : "Aligned",
      },
    })),
  });
}
