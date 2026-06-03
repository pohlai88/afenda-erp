import { hrTimeClockDevicesColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockDevicesSurfaceKey =
  "hr.time.clock-integration.devices.list";

export const hrTimeClockDevicesSearchParam = "timeClockDevicesSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEnumCell,
  resolveTimeClockAdminTrailingAction,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";
import type { HrTimeClockDeviceWindow } from "@afenda/db";

export function buildHrTimeClockDevicesListSurface(input: {
  window: HrTimeClockDeviceWindow;
  searchValue?: string;
  canAdmin: boolean;
}) {
  const copy = hrTimeClockUiCopy.devices;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "device",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockDevicesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockDevicesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "device", header: copy.colDevice, priority: "primary", wrap: true },
      { id: "type", header: copy.colType },
      { id: "location", header: copy.colLocation },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "lastSync",
        header: copy.colLastSync,
        cellKind: { kind: "date" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        device: `${row.name} (${row.externalDeviceId})`,
        type: formatTimeClockEnumCell(row.deviceType),
        location: row.locationCode ?? "—",
        status: formatTimeClockEnumCell(row.status),
        lastSync: row.lastSyncAt?.toISOString() ?? "—",
      },
      trailingAction: resolveTimeClockAdminTrailingAction(input.canAdmin),
    })),
  });
}
