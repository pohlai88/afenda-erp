import type { HrOrgHeadcountWindow } from "@afenda/db";

import { hrOrgHeadcountSearchParam } from "../data/hr.workforce.org-search-params.parse.shared";
import {
  buildOrgListSearchToolbar,
  buildOrgOperationalListSurface,
  formatOrgEnumLabel,
} from "./hr.workforce.org-list.shared";
import { hrOrgHeadcountColumnsId } from "./hr.workforce.org-surface-columns.shared";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared";

export const hrOrgHeadcountSurfaceKey = "hr.workforce.org.headcount.list";

export function buildHrOrgHeadcountListSurface(input: {
  window: HrOrgHeadcountWindow;
  searchValue?: string;
}) {
  const copy = hrOrgUiCopy.headcount;

  return buildOrgOperationalListSurface({
    primaryColumnId: "unit",
    searchToolbar: buildOrgListSearchToolbar({
      param: hrOrgHeadcountSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOrgHeadcountColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "unit", header: copy.colUnit, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "unitType", header: copy.colType, cellKind: { kind: "badge", tone: "default" } },
      { id: "filled", header: copy.colFilled, cellKind: { kind: "text" } },
      { id: "vacant", header: copy.colVacant, cellKind: { kind: "text" } },
      { id: "total", header: copy.colTotal, cellKind: { kind: "text" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.orgUnitId,
      cells: {
        unit: `${row.orgUnitName} (${row.orgUnitCode})`,
        unitType: formatOrgEnumLabel(row.unitType),
        filled: String(row.filledHeadcount),
        vacant: String(row.vacantPositionCount),
        total: String(row.totalPositionCount),
      },
    })),
  });
}
