import type { HrShiftScheduleChangeRequestWindow } from "./hrs-hr-time-sft-schedule-change-server";
import { hrTimeSftMyScheduleChangesSurfaceKey } from "./hr.time.sft.contract";
import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftEnumCell,
} from "./hr.time.sft-list.shared";
import {
  hrSftMyScheduleChangesColumnsId,
  hrSftMyScheduleChangesSearchParam,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftMyScheduleChangesSurfaceKey };

/** HRM-SFT-024 — Pattern C employee schedule change history. */
export function buildHrTimeSftMyScheduleChangesListSurface(input: {
  window: HrShiftScheduleChangeRequestWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.myScheduleChanges;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftMyScheduleChangesSurfaceKey,
    primaryColumnId: "status",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftMyScheduleChangesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftMyScheduleChangesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "status",
        header: copy.colStatus,
        pin: "start",
        priority: "primary",
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
