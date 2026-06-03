import {
  hrGeoDevicesColumnsId,
  hrGeoDevicesSearchParam,
} from "./hrs-geolocation-contract";
import {
  buildGeoListSearchToolbar,
  buildGeoOperationalListSurface,
  formatGeoEmployeeCell,
  formatGeoEnumCell,
} from "./hr.time.geo-list.shared";
import type { HrGeoDevicesWindow } from "./hr.time.geo-list-window-types.shared";
import { hrGeoUiCopy } from "./hr.time.geo-ui.copy.shared";

export function buildHrGeoDevicesListSurface(input: {
  window: HrGeoDevicesWindow;
  searchValue?: string;
}) {
  const copy = hrGeoUiCopy.devices;

  return buildGeoOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildGeoListSearchToolbar({
      param: hrGeoDevicesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrGeoDevicesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, priority: "primary", wrap: true },
      { id: "device", header: copy.colDevice, wrap: true },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "registered",
        header: copy.colRegistered,
        cellKind: { kind: "date" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatGeoEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        device: row.deviceLabel ?? row.deviceFingerprint.slice(0, 12),
        status: formatGeoEnumCell(row.status),
        registered: row.registeredAt.toISOString(),
      },
    })),
  });
}
