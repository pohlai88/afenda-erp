import type { HrOrgReportingLineWindow } from "@afenda/db";

import { hrOrgReportingLinesSearchParam } from "../data/hr.workforce.org-search-params.parse.shared";
import {
  buildOrgListSearchToolbar,
  buildOrgOperationalListSurface,
  formatOrgDate,
  formatOrgEnumLabel,
} from "./hr.workforce.org-list.shared";
import { hrOrgReportingLinesColumnsId } from "./hr.workforce.org-surface-columns.shared";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared";

export const hrOrgReportingLinesSurfaceKey =
  "hr.workforce.org.reporting-lines.list";

export function buildHrOrgReportingLinesListSurface(input: {
  window: HrOrgReportingLineWindow;
  searchValue?: string;
}) {
  const copy = hrOrgUiCopy.reportingLines;

  return buildOrgOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildOrgListSearchToolbar({
      param: hrOrgReportingLinesSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrOrgReportingLinesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, pin: "start", minWidth: 180, cellKind: { kind: "text" } },
      { id: "manager", header: copy.colManager, cellKind: { kind: "text" } },
      { id: "relationshipType", header: copy.colType, cellKind: { kind: "badge", tone: "default" } },
      { id: "department", header: copy.colDepartment, cellKind: { kind: "text" } },
      { id: "position", header: copy.colPosition, cellKind: { kind: "text" } },
      { id: "effectiveFrom", header: copy.colEffectiveFrom, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeDisplayName} (${row.employeeNumber})`,
        manager: row.managerDisplayName,
        relationshipType: formatOrgEnumLabel(row.relationshipType),
        department: row.departmentName ?? "—",
        position: row.positionTitle ?? "—",
        effectiveFrom: formatOrgDate(row.effectiveFrom),
      },
    })),
  });
}
