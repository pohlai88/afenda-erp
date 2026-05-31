import { hrTimeClockOvertimeRefsColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockOvertimeRefsSurfaceKey =
  "hr.time.clock-integration.overtime-refs.list";

export const hrTimeClockOvertimeRefsSearchParam = "timeClockOvertimeRefsSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEmployeeCell,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";
import type { HrTimeClockOvertimeRefRow } from "../data/hr.time.clock-integration-overtime-refs.shared.server";

export function buildHrTimeClockOvertimeRefsListSurface(input: {
  rows: readonly HrTimeClockOvertimeRefRow[];
  searchValue?: string;
}) {
  const copy = hrTimeClockUiCopy.overtimeRefs;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockOvertimeRefsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: {
      rows: input.rows,
      pageSize: input.rows.length || 25,
      totalCount: input.rows.length,
      hasNextPage: false,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockOvertimeRefsColumnsId,
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
      { id: "hours", header: copy.colHours },
      { id: "punchSpan", header: copy.colPunchSpan, wrap: true },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatTimeClockEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        workDate: row.workDate.toISOString(),
        hours: row.workHours.toFixed(2),
        punchSpan: row.punchSpanLabel,
        status: row.exposureStatus,
      },
    })),
  });
}
