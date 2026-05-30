import type { HrEmployeeAssignmentHistoryWindow } from "@afenda/db";

import {
  buildRecordsListSearchToolbar,
  buildRecordsOperationalListSurface,
  formatRecordsAssignmentStatusLabel,
} from "./hr.workforce.records-list.shared";
import { hrRecordsAssignmentsColumnsId } from "./hr.workforce.records-surface-columns.shared";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

export const hrRecordsAssignmentsSurfaceKey =
  "hr.workforce.records.assignments.list";

export const hrRecordsAssignmentsSearchParam = "recordsAssignmentsSearch";

export function buildHrRecordsAssignmentsListSurface(input: {
  window: HrEmployeeAssignmentHistoryWindow;
  searchValue?: string;
}): ReturnType<typeof buildRecordsOperationalListSurface> {
  const { window, searchValue } = input;
  const copy = hrRecordsUiCopy.assignments;

  return buildRecordsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildRecordsListSearchToolbar({
      param: hrRecordsAssignmentsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrRecordsAssignmentsColumnsId,
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
        id: "department",
        header: copy.colDepartment,
        wrap: true,
        minWidth: 140,
      },
      {
        id: "position",
        header: copy.colPosition,
        wrap: true,
        minWidth: 140,
      },
      {
        id: "manager",
        header: copy.colManager,
        wrap: true,
        minWidth: 140,
      },
      {
        id: "effectiveFrom",
        header: copy.colEffectiveFrom,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "effectiveTo",
        header: copy.colEffectiveTo,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "reason",
        header: copy.colReason,
        wrap: true,
        minWidth: 160,
      },
    ],
    rows: window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.displayName}`,
        employeeIdValue: row.employeeId,
        department: row.departmentName ?? "—",
        position: row.positionTitle ?? "—",
        manager: row.managerDisplayName ?? "—",
        effectiveFrom: row.effectiveFrom.toISOString(),
        effectiveTo: row.effectiveTo?.toISOString() ?? "",
        status: formatRecordsAssignmentStatusLabel(row.assignmentStatus),
        reason: row.reason ?? "—",
      },
      cellKinds: {
        status: {
          kind: "badge",
          tone: row.assignmentStatus === "active" ? "default" : "attention",
        },
      },
    })),
  });
}
