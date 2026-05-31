import type { HrShiftAttendanceReconcileWindow } from "@afenda/db";

import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftMismatchReason,
} from "./hr.time.sft-list.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";
import {
  hrSftAttendanceReconcileColumnsId,
  hrSftAttendanceReconcileSearchParam,
  hrSftAttendanceReconcileSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";

export { hrSftAttendanceReconcileSurfaceKey };

export function buildHrSftAttendanceReconcileListSurface(input: {
  window: HrShiftAttendanceReconcileWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.attendanceReconcile;

  return buildSftOperationalListSurface({
    surfaceKey: hrSftAttendanceReconcileSurfaceKey,
    primaryColumnId: "employee",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftAttendanceReconcileSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftAttendanceReconcileColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        priority: "primary",
      },
      { id: "shift", header: copy.colShift },
      { id: "attendance", header: copy.colAttendance },
      { id: "status", header: copy.colStatus },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeDisplayName} (${row.employeeNumber})`,
        shift: `${row.scheduledTemplateCode} · ${row.shiftDate.toISOString().slice(0, 10)}`,
        attendance: row.attendanceStatus ?? "—",
        status: row.aligned
          ? "Aligned"
          : formatSftMismatchReason(row.mismatchReason),
      },
    })),
  });
}
