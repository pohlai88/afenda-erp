import {
  hrGeoHistoryColumnsId,
  hrGeoHistorySearchParam,
} from "../contracts/geolocation.contract";
import type { HrGeoHistoryWindow } from "./hr.time.geo-list-window-types.shared";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
  formatGeoEmployeeCell,
  formatGeoEnumCell,
} from "./hr.time.geo-list.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

export function buildHrGeoHistoryListSurface(input: {
  window: HrGeoHistoryWindow;
  searchValue?: string;
}) {
  const copy = hrGeoUiCopy.history;

  return buildGeoOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoHistorySearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoHistoryColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, priority: "primary", wrap: true },
      {
        id: "action",
        header: copy.colAction,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "captured",
        header: copy.colCaptured,
        cellKind: { kind: "date" },
      },
      { id: "location", header: copy.colLocation, wrap: true },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatGeoEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        action: formatGeoEnumCell(row.action),
        status: formatGeoEnumCell(row.status),
        captured: row.capturedAt.toISOString(),
        location:
          row.maskedLatitude && row.maskedLongitude
            ? `${row.maskedLatitude}, ${row.maskedLongitude}`
            : row.geofenceLabel ?? "Unavailable",
      },
    })),
  });
}
