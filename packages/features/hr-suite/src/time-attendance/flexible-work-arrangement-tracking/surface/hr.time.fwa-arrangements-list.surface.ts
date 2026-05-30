import type { HrFwaArrangementWindow } from "@afenda/db";

import {
  buildFwaListSearchToolbar,
  buildFwaOperationalListSurface,
  formatFwaEmployeeListCell,
  formatFwaEnumCell,
} from "./hr.time.fwa-list.shared";
import {
  hrFwaArrangementsColumnsId,
  hrFwaArrangementsSearchParam,
  hrFwaArrangementsSurfaceKey,
} from "./hr.time.fwa-surface-metadata.shared";
import { hrFwaUiCopy } from "./hr.time.fwa-ui.copy.shared";

export {
  hrFwaArrangementsSearchParam,
  hrFwaArrangementsSurfaceKey,
};

export function buildHrFwaArrangementsListSurface(input: {
  window: HrFwaArrangementWindow;
  searchValue?: string;
}) {
  const copy = hrFwaUiCopy.arrangements;

  return buildFwaOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildFwaListSearchToolbar({
      param: hrFwaArrangementsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrFwaArrangementsColumnsId,
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
        id: "effective",
        header: copy.colEffective,
        cellKind: { kind: "date" },
        minWidth: 120,
      },
      {
        id: "review",
        header: copy.colReview,
        cellKind: { kind: "date" },
        minWidth: 120,
      },
      {
        id: "renewal",
        header: copy.colRenewal,
        cellKind: { kind: "date" },
        minWidth: 120,
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
        effective: row.effectiveFrom.toISOString(),
        review: row.reviewDate?.toISOString() ?? "—",
        renewal: row.renewalDate?.toISOString() ?? "—",
      },
    })),
  });
}
