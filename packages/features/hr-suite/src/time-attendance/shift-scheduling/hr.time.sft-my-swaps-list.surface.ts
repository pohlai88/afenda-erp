import type { HrShiftSwapRequestWindow } from "@afenda/db";

import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftEmployeeCell,
  formatSftEnumCell,
} from "./hr.time.sft-list.shared";
import {
  hrSftMySwapsColumnsId,
  hrSftMySwapsSearchParam,
  hrTimeSftMySwapsSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftMySwapsSurfaceKey };

/** HRM-SFT-019 — Pattern C employee swap history + submit form host surface. */
export function buildHrTimeSftMySwapsListSurface(input: {
  window: HrShiftSwapRequestWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.mySwaps;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftMySwapsSurfaceKey,
    primaryColumnId: "target",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftMySwapsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftMySwapsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "target",
        header: copy.colTarget,
        priority: "primary",
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
      {
        id: "decision",
        header: copy.colDecision,
        wrap: true,
        minWidth: 160,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        target: row.targetDisplayName
          ? formatSftEmployeeCell({
              employeeNumber: row.targetEmployeeNumber ?? "—",
              employeeDisplayName: row.targetDisplayName,
            })
          : "Open swap",
        status: formatSftEnumCell(row.status),
        reason: row.reason,
        submitted: row.submittedAt.toISOString(),
        decision:
          row.rejectionReason?.trim() ||
          row.overrideReason?.trim() ||
          (row.decidedAt ? "—" : "Pending"),
      },
    })),
  });
}
