import type { HrSftAvailabilityWindow } from "./hrs-hr-time-sft-availability-server";
import { hrTimeSftAvailabilitySurfaceKey } from "./hr.time.sft.contract";
import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftEnumCell,
} from "./hr.time.sft-list.shared";
import {
  hrSftAvailabilityColumnsId,
  hrSftAvailabilitySearchParam,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftAvailabilitySurfaceKey };

/** HRM-SFT-011 — Pattern B employee availability windows. */
export function buildHrTimeSftAvailabilityListSurface(input: {
  window: HrSftAvailabilityWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.availability;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftAvailabilitySurfaceKey,
    primaryColumnId: "kind",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftAvailabilitySearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftAvailabilityColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "kind",
        header: copy.colKind,
        pin: "start",
        priority: "primary",
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "start",
        header: copy.colStart,
        cellKind: { kind: "date" },
        minWidth: 120,
      },
      {
        id: "end",
        header: copy.colEnd,
        cellKind: { kind: "date" },
        minWidth: 120,
      },
      { id: "reason", header: copy.colReason, wrap: true, minWidth: 200 },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        kind: formatSftEnumCell(row.availabilityKind),
        start: row.startDate.toISOString(),
        end: row.endDate.toISOString(),
        reason: row.reason?.trim() || "—",
      },
    })),
  });
}
