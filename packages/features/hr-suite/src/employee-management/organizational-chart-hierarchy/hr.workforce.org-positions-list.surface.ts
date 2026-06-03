import type { HrOrgPositionWindow } from "@afenda/db";

import { hrOrgPositionsSearchParam } from "./hr.workforce.org-search-params.parse.shared";
import {
  buildOrgListSearchToolbar,
  buildOrgOperationalListSurface,
  formatOrgEnumLabel,
} from "./hr.workforce.org-list.shared";
import { hrOrgPositionsColumnsId } from "./hr.workforce.org-surface-columns.shared";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared";

export const hrOrgPositionsSurfaceKey = "hr.workforce.org.positions.list";

export function buildHrOrgPositionsListSurface(input: {
  window: HrOrgPositionWindow;
  searchValue?: string;
}) {
  const copy = hrOrgUiCopy.positions;

  return buildOrgOperationalListSurface({
    primaryColumnId: "title",
    searchToolbar: buildOrgListSearchToolbar({
      param: hrOrgPositionsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOrgPositionsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, priority: "primary", cellKind: { kind: "text" } },
      { id: "title", header: copy.colTitle, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "department", header: copy.colDepartment, cellKind: { kind: "text" } },
      { id: "occupancy", header: copy.colOccupancy, cellKind: { kind: "badge", tone: "attention" } },
      { id: "manager", header: copy.colManager, cellKind: { kind: "text" } },
      { id: "location", header: copy.colLocation, cellKind: { kind: "text" } },
      { id: "status", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        title: row.title,
        department: row.departmentName,
        occupancy: formatOrgEnumLabel(row.occupancyStatus),
        manager: row.managerDisplayName ?? "—",
        location: row.locationCode ?? "—",
        status: formatOrgEnumLabel(row.positionStatus),
      },
      cellKinds: {
        occupancy: {
          kind: "badge",
          tone: row.occupancyStatus === "vacant" ? "attention" : "default",
        },
      },
    })),
  });
}
