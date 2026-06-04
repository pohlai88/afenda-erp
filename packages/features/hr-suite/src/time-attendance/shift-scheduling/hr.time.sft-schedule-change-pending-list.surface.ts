import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import type { HrShiftScheduleChangeRequestWindow } from "./hrs-hr-time-sft-schedule-change-server";
import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftEmployeeCell,
  formatSftEnumCell,
} from "./hr.time.sft-list.shared";
import {
  hrSftScheduleChangePendingColumnsId,
  hrSftScheduleChangePendingSearchParam,
  hrTimeSftScheduleChangePendingSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftScheduleChangePendingSurfaceKey };

/** HRM-SFT-024 — Pattern C manager schedule change inbox. */
export function buildHrTimeSftScheduleChangePendingListSurface(input: {
  window: HrShiftScheduleChangeRequestWindow;
  searchValue?: string;
  canManage?: boolean;
}) {
  const copy = hrSftUiCopy.scheduleChangePending;
  const canManage = input.canManage ?? false;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftScheduleChangePendingSurfaceKey,
    primaryColumnId: "employee",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftScheduleChangePendingSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftScheduleChangePendingColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "reason",
        header: copy.colReason,
        wrap: true,
        minWidth: 200,
      },
      {
        id: "submitted",
        header: copy.colSubmitted,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowTone: "attention",
      trailingAction: canManage
        ? resolveListSurfaceRowTrailingAction({ visible: true, allowed: true })
        : resolveListSurfaceRowTrailingAction({
            visible: true,
            allowed: false,
            disabledReason: "Manage shift schedule permission required.",
          }),
      cells: {
        employee: formatSftEmployeeCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        status: formatSftEnumCell(row.status),
        reason: row.reason,
        submitted: row.submittedAt.toISOString(),
      },
    })),
  });
}
