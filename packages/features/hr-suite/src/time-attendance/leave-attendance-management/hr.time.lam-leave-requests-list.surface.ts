import type { HrLeaveRequestWindow } from "@afenda/db";

import {
  buildLamListSearchToolbar,
  buildLamOperationalListSurface,
  formatLamEmployeeListCell,
  formatLamEnumCell,
} from "./hr.time.lam-list.shared";
import { hrTimeLamReadPermission } from "./hr.time.lam.contract";
import { hrLamLeaveRequestsColumnsId } from "./hr.time.lam-surface-metadata.shared";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";

export {
  hrLamLeaveRequestsSearchParam,
  hrLamLeaveRequestsSurfaceKey,
} from "./hr.time.lam-surface-metadata.shared";

export function buildHrLamLeaveRequestsListSurface(input: {
  window: HrLeaveRequestWindow;
  searchValue?: string;
}) {
  const copy = hrLamUiCopy.leaveRequests;

  return buildLamOperationalListSurface({
    primaryColumnId: "employee",
    requiresErpPermission: hrTimeLamReadPermission,
    searchToolbar: buildLamListSearchToolbar({
      param: "lamLeaveRequestsSearch",
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLamLeaveRequestsColumnsId,
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
        id: "leaveType",
        header: "Leave type",
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: "Status",
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "duration",
        header: "Days",
        minWidth: 80,
      },
      {
        id: "submittedAt",
        header: "Submitted",
        cellKind: { kind: "date" },
        minWidth: 140,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: formatLamEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        leaveType: formatLamEnumCell(row.leaveType),
        status: formatLamEnumCell(row.status),
        duration: row.durationDays,
        submittedAt: row.submittedAt.toISOString(),
      },
    })),
  });
}
