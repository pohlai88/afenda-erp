import type { HrEmployeeIncompleteProfilesWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "./hr.workforce.records-route.contract";
import {
  buildRecordsListSearchToolbar,
  buildRecordsOperationalListSurface,
  formatRecordsEmploymentStatusLabel,
  formatRecordsMissingFieldsLabel,
} from "./hr.workforce.records-list.shared";
import { hrRecordsIncompleteColumnsId } from "./hr.workforce.records-surface-columns.shared";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

export const hrRecordsIncompleteSurfaceKey =
  "hr.workforce.records.incomplete.list";

export const hrRecordsIncompleteSearchParam = "recordsIncompleteSearch";

export function buildHrRecordsIncompleteListSurface(input: {
  window: HrEmployeeIncompleteProfilesWindow;
  searchValue?: string;
}): ReturnType<typeof buildRecordsOperationalListSurface> {
  const { window, searchValue } = input;
  const copy = hrRecordsUiCopy.incomplete;

  return buildRecordsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildRecordsListSearchToolbar({
      param: hrRecordsIncompleteSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrRecordsIncompleteColumnsId,
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
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "missing",
        header: copy.colMissing,
        wrap: true,
        minWidth: 220,
      },
    ],
    rows: window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.displayName}`,
        employeeIdValue: row.id,
        status: formatRecordsEmploymentStatusLabel(row.employmentStatus),
        missing: formatRecordsMissingFieldsLabel(row.missingFields),
      },
      rowHref: hrEmployeeDetailRoutePath(row.id),
    })),
  });
}
