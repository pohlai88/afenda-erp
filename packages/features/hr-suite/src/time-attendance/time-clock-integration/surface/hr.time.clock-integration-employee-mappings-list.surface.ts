import type { HrTimeClockEmployeeMappingWindow } from "@afenda/db";

import { hrTimeClockEmployeeMappingsColumnsId } from "./hr.time.clock-integration-surface-columns.shared";

export const hrTimeClockEmployeeMappingsSurfaceKey =
  "hr.time.clock-integration.employee-mappings.list";

export const hrTimeClockEmployeeMappingsSearchParam =
  "timeClockEmployeeMappingsSearch";
import {
  buildTimeClockListSearchToolbar,
  buildTimeClockOperationalListSurface,
  formatTimeClockEmployeeCell,
  formatTimeClockEnumCell,
  resolveTimeClockAdminTrailingAction,
} from "./hr.time.clock-integration-list.shared";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

export function buildHrTimeClockEmployeeMappingsListSurface(input: {
  window: HrTimeClockEmployeeMappingWindow;
  searchValue?: string;
  canAdmin: boolean;
}) {
  const copy = hrTimeClockUiCopy.mappings;

  return buildTimeClockOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildTimeClockListSearchToolbar({
      param: hrTimeClockEmployeeMappingsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrTimeClockEmployeeMappingsColumnsId,
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
      { id: "device", header: copy.colDevice, wrap: true },
      { id: "deviceUserId", header: copy.colDeviceUserId },
      { id: "badgeId", header: copy.colBadgeId },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatTimeClockEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeePreferredName ?? row.employeeLegalName,
        }),
        device: `${row.deviceName} (${row.externalDeviceId})`,
        deviceUserId: row.deviceUserId ?? "—",
        badgeId: row.badgeId ?? "—",
        status: formatTimeClockEnumCell(row.status),
      },
      trailingAction: resolveTimeClockAdminTrailingAction(input.canAdmin),
    })),
  });
}
