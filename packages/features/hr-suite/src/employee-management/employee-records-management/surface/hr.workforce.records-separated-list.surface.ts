import type { HrEmployeeSeparatedWindow } from "@afenda/db";
import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import {
  buildRecordsListSearchToolbar,
  buildRecordsOperationalListSurface,
  formatRecordsEmploymentStatusLabel,
} from "./hr.workforce.records-list.shared";
import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.records-route.contract";
import { hrRecordsSeparatedColumnsId } from "./hr.workforce.records-surface-columns.shared";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

export const hrRecordsSeparatedSurfaceKey =
  "hr.workforce.records.separated.list";

export const hrRecordsSeparatedSearchParam = "recordsSeparatedSearch";

function resolveSeparatedRehireTrailingAction(canWrite: boolean) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: true,
  });
}

export function buildHrRecordsSeparatedListSurface(input: {
  window: HrEmployeeSeparatedWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ReturnType<typeof buildRecordsOperationalListSurface> {
  const copy = hrRecordsUiCopy.separated;
  const canWrite = input.canWrite ?? false;

  return buildRecordsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildRecordsListSearchToolbar({
      param: hrRecordsSeparatedSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrRecordsSeparatedColumnsId,
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
        id: "archivedAt",
        header: copy.colArchived,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
      {
        id: "startDate",
        header: copy.colStartDate,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.displayName}`,
        employeeIdValue: row.id,
        employeeNumberValue: row.employeeNumber,
        legalNameValue: row.displayName,
        status: formatRecordsEmploymentStatusLabel(row.employmentStatus),
        department: row.departmentName ?? "—",
        position: row.positionTitle ?? "—",
        archivedAt: row.archivedAt?.toISOString() ?? "",
        startDate: row.employmentStartDate?.toISOString() ?? "",
      },
      rowHref: hrEmployeeDetailRoutePath(row.id),
      trailingAction: resolveSeparatedRehireTrailingAction(canWrite),
    })),
  });
}
