import { hrTimeClockPayrollRefsColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockPayrollRefsSurfaceKey =
  "hr.time.clock-integration.payroll-refs.list";

export const hrTimeClockPayrollRefsSearchParam = "timeClockPayrollRefsSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEmployeeCell,
  formatTimeClockEnumCell,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";
import type { HrTimeClockPayrollRefRow } from "./hr.time.clock-integration-payroll-refs.shared.server";

export function buildHrTimeClockPayrollRefsListSurface(input: {
  rows: readonly HrTimeClockPayrollRefRow[];
  searchValue?: string;
}) {
  const copy = hrTimeClockUiCopy.payrollRefs;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockPayrollRefsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: {
      pageSize: input.rows.length || 25,
      totalCount: input.rows.length,
      hasNextPage: false,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockPayrollRefsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        wrap: true,
      },
      {
        id: "workDate",
        header: copy.colWorkDate,
        cellKind: { kind: "date" },
      },
      {
        id: "attendanceStatus",
        header: copy.colAttendanceStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "payrollRef", header: copy.colPayrollRef },
      { id: "source", header: copy.colSource },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatTimeClockEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        workDate: row.workDate.toISOString(),
        attendanceStatus: formatTimeClockEnumCell(row.attendanceStatus),
        payrollRef: row.payrollReference ?? "—",
        source: row.source,
      },
    })),
  });
}
