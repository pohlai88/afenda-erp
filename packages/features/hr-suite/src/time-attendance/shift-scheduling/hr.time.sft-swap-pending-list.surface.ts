import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import type { HrShiftSwapRequestWindow } from "@afenda/db";

import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftEmployeeCell,
  formatSftEnumCell,
} from "./hr.time.sft-list.shared";
import {
  hrSftSwapPendingColumnsId,
  hrSftSwapPendingSearchParam,
  hrTimeSftSwapPendingSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftSwapPendingSurfaceKey };

/** HRM-SFT-021/022 — Pattern C manager swap approval inbox. */
export function buildHrTimeSftSwapPendingListSurface(input: {
  window: HrShiftSwapRequestWindow;
  searchValue?: string;
  canManage?: boolean;
}) {
  const copy = hrSftUiCopy.swapPending;
  const canManage = input.canManage ?? false;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftSwapPendingSurfaceKey,
    primaryColumnId: "requester",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftSwapPendingSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftSwapPendingColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "requester",
        header: copy.colRequester,
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "target",
        header: copy.colTarget,
        wrap: true,
        minWidth: 180,
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
        requester: formatSftEmployeeCell({
          employeeNumber: row.requesterEmployeeNumber,
          employeeDisplayName: row.requesterDisplayName,
        }),
        target: row.targetDisplayName
          ? formatSftEmployeeCell({
              employeeNumber: row.targetEmployeeNumber ?? "—",
              employeeDisplayName: row.targetDisplayName,
            })
          : "Open swap",
        status: formatSftEnumCell(row.status),
        reason: row.reason,
        submitted: row.submittedAt.toISOString(),
      },
    })),
  });
}
