import type { HrLeaveBalanceWindow } from "@afenda/db";

import {
  buildLamListSearchToolbar,
  buildLamOperationalListSurface,
  formatLamEmployeeListCell,
  formatLamEnumCell,
} from "./hr.time.lam-list.shared";
import { hrTimeLamReadPermission } from "../contracts/hr.time.lam.contract";
import { hrLamLeaveBalancesColumnsId } from "./hr.time.lam-surface-metadata.shared";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";

export {
  hrLamLeaveBalancesSearchParam,
  hrLamLeaveBalancesSurfaceKey,
} from "./hr.time.lam-surface-metadata.shared";

export function buildHrLamLeaveBalancesListSurface(input: {
  window: HrLeaveBalanceWindow;
  searchValue?: string;
}) {
  const copy = hrLamUiCopy.leaveBalances;

  return buildLamOperationalListSurface({
    primaryColumnId: "employee",
    requiresErpPermission: hrTimeLamReadPermission,
    searchToolbar: buildLamListSearchToolbar({
      param: "lamLeaveBalancesSearch",
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLamLeaveBalancesColumnsId,
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
        id: "earned",
        header: "Earned",
        minWidth: 80,
      },
      {
        id: "used",
        header: "Used",
        minWidth: 80,
      },
      {
        id: "pending",
        header: "Pending",
        minWidth: 80,
      },
      {
        id: "remaining",
        header: "Remaining",
        minWidth: 90,
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
        earned: row.earnedDays,
        used: row.usedDays,
        pending: row.pendingDays,
        remaining: row.remainingDays,
      },
    })),
  });
}
