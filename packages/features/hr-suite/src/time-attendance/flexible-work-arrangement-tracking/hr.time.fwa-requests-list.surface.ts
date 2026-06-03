import type { HrFwaRequestWindow } from "@afenda/db";

import {
  buildFwaListSearchToolbar,
  buildFwaOperationalListSurface,
  formatFwaEmployeeListCell,
  formatFwaEnumCell,
} from "./hr.time.fwa-list.shared";
import {
  hrFwaRequestsColumnsId,
  hrFwaRequestsSearchParam,
  hrFwaRequestsSurfaceKey,
} from "./hr.time.fwa-surface-metadata.shared";
import { hrFwaUiCopy } from "./hr.time.fwa-ui.copy.shared";

export {
  hrFwaRequestsSearchParam,
  hrFwaRequestsSurfaceKey,
};

export function buildHrFwaRequestsListSurface(input: {
  window: HrFwaRequestWindow;
  searchValue?: string;
}) {
  const copy = hrFwaUiCopy.requests;

  return buildFwaOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildFwaListSearchToolbar({
      param: hrFwaRequestsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrFwaRequestsColumnsId,
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
        id: "kind",
        header: copy.colKind,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
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
      cells: {
        employee: formatFwaEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        kind: formatFwaEnumCell(row.arrangementKind),
        status: formatFwaEnumCell(row.status),
        submitted: row.submittedAt.toISOString(),
      },
    })),
  });
}
