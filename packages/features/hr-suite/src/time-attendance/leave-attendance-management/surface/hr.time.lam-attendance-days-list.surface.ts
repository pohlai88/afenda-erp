import type { HrAttendanceDayWindow } from "@afenda/db";

import {
  buildLamListSearchToolbar,
  buildLamOperationalListSurface,
  formatLamEmployeeListCell,
  formatLamEnumCell,
} from "./hr.time.lam-list.shared";
import { hrLamAttendanceDaysColumnsId } from "./hr.time.lam-surface-metadata.shared";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";

export {
  hrLamAttendanceDaysSearchParam,
  hrLamAttendanceDaysSurfaceKey,
} from "./hr.time.lam-surface-metadata.shared";

export function buildHrLamAttendanceDaysListSurface(input: {
  window: HrAttendanceDayWindow;
  searchValue?: string;
}) {
  const copy = hrLamUiCopy.attendanceDays;

  return buildLamOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLamListSearchToolbar({
      param: "lamAttendanceDaysSearch",
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLamAttendanceDaysColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: "Employee",
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "workDate",
        header: "Date",
        cellKind: { kind: "date" },
        minWidth: 120,
      },
      {
        id: "status",
        header: "Status",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "calendar",
        header: "Calendar",
        minWidth: 120,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatLamEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        workDate: row.workDate.toISOString(),
        status: formatLamEnumCell(row.status),
        calendar: row.workCalendarCode,
      },
    })),
  });
}
