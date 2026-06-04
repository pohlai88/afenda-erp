import type { HrShiftRosterWindow } from "./hr.time.sft-roster.server";
import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftEnumLabel,
} from "./hr.time.sft-list.shared";
import {
  hrSftRosterColumnsId,
  hrSftRosterSearchParam,
  hrTimeSftRosterSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";

export { hrTimeSftRosterSurfaceKey };

/** HRM-SFT-004 — Pattern B date-range roster. */
export function buildHrTimeSftRosterListSurface(input: {
  window: HrShiftRosterWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.roster;

  return buildSftOperationalListSurface({
    surfaceKey: hrTimeSftRosterSurfaceKey,
    primaryColumnId: "employee",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftRosterSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftRosterColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        priority: "primary",
        wrap: true,
        minWidth: 200,
      },
      { id: "date", header: copy.colDate, cellKind: { kind: "date" }, minWidth: 120 },
      { id: "shift", header: copy.colShift, wrap: true, minWidth: 160 },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "location", header: copy.colLocation },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.employeeDisplayName}`,
        date: row.shiftDate.toISOString(),
        shift: `${row.templateCode} — ${row.templateName}`,
        status: formatSftEnumLabel(row.status),
        location: row.locationCode ?? "—",
      },
    })),
  });
}
