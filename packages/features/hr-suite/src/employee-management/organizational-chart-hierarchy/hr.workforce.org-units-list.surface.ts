import type { HrOrgUnitWindow } from "@afenda/db";

import { hrOrgUnitsSearchParam } from "./hr.workforce.org-search-params.parse.shared";
import {
  buildOrgListSearchToolbar,
  buildOrgOperationalListSurface,
  formatOrgDate,
  formatOrgEnumLabel,
} from "./hr.workforce.org-list.shared";
import { hrOrgUnitsColumnsId } from "./hr.workforce.org-surface-columns.shared";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared";

export const hrOrgUnitsSurfaceKey = "hr.workforce.org.units.list";

export function buildHrOrgUnitsListSurface(input: {
  window: HrOrgUnitWindow;
  searchValue?: string;
}) {
  const copy = hrOrgUiCopy.units;

  return buildOrgOperationalListSurface({
    primaryColumnId: "name",
    searchToolbar: buildOrgListSearchToolbar({
      param: hrOrgUnitsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOrgUnitsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, priority: "primary", cellKind: { kind: "text" } },
      { id: "name", header: copy.colName, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "unitType", header: copy.colType, cellKind: { kind: "badge", tone: "default" } },
      { id: "parent", header: copy.colParent, cellKind: { kind: "text" } },
      { id: "manager", header: copy.colManager, cellKind: { kind: "text" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "location", header: copy.colLocation, cellKind: { kind: "text" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        unitType: formatOrgEnumLabel(row.unitType),
        parent: row.parentDepartmentName ?? "—",
        manager: row.managerDisplayName ?? "—",
        status: formatOrgEnumLabel(row.orgUnitStatus),
        location: row.locationCode ?? "—",
        effectiveFrom: formatOrgDate(row.effectiveFrom),
      },
    })),
  });
}
