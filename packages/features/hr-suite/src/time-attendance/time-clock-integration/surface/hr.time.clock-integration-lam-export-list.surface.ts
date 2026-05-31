import type { HrTimeClockValidatedPunchWindow } from "@afenda/db";

import { hrTimeClockLamExportColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockLamExportSurfaceKey =
  "hr.time.clock-integration.lam-export.list";

export const hrTimeClockLamExportSearchParam = "timeClockLamExportSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEmployeeCell,
  formatTimeClockEnumCell,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

export function buildHrTimeClockLamExportListSurface(input: {
  window: HrTimeClockValidatedPunchWindow;
  searchValue?: string;
}) {
  const copy = hrTimeClockUiCopy.lamExport;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockLamExportSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockLamExportColumnsId,
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
      { id: "device", header: copy.colDevice },
      { id: "location", header: copy.colLocation },
      { id: "punchType", header: copy.colPunchType },
      {
        id: "punchedAt",
        header: copy.colPunchedAt,
        cellKind: { kind: "date" },
      },
      {
        id: "workDate",
        header: copy.colWorkDate,
        cellKind: { kind: "date" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatTimeClockEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        device: row.deviceName,
        location: row.locationCode ?? "—",
        punchType: formatTimeClockEnumCell(row.punchType),
        punchedAt: row.punchedAt.toISOString(),
        workDate: row.workDate.toISOString(),
      },
    })),
  });
}
