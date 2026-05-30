import type { HrEmployeeDirectoryWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.records-route.contract";
import { maskHrEmployeeSensitiveEmail } from "../data/hr.workforce.records-sensitive-access.shared";
import {
  buildRecordsListSearchToolbar,
  buildRecordsOperationalListSurface,
  formatRecordsEmploymentStatusLabel,
  resolveRecordsListTrailingAction,
} from "./hr.workforce.records-list.shared";
import { hrRecordsDirectoryColumnsId } from "./hr.workforce.records-surface-columns.shared";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

export const hrRecordsDirectorySurfaceKey =
  "hr.workforce.records.directory.list";

export const hrRecordsDirectorySearchParam = "recordsDirectorySearch";

export const hrRecordsEmploymentStatusFilterParam =
  "recordsEmploymentStatus";

export function buildHrRecordsDirectoryListSurface(input: {
  window: HrEmployeeDirectoryWindow;
  searchValue?: string;
  canViewSensitive?: boolean;
  canWrite?: boolean;
}): ReturnType<typeof buildRecordsOperationalListSurface> {
  const {
    window,
    searchValue,
    canViewSensitive = false,
    canWrite = false,
  } = input;
  const copy = hrRecordsUiCopy.directory;

  return buildRecordsOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildRecordsListSearchToolbar({
      param: hrRecordsDirectorySearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrRecordsDirectoryColumnsId,
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
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "email",
        header: copy.colEmail,
        wrap: true,
        minWidth: 180,
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
        id: "startDate",
        header: copy.colStartDate,
        cellKind: { kind: "date" },
        minWidth: 140,
      },
    ],
    rows: window.rows.map((row) => ({
      id: row.id,
      cells: {
        employee: `${row.employeeNumber} · ${row.displayName}`,
        employeeIdValue: row.id,
        employeeNumberValue: row.employeeNumber,
        legalNameValue: row.displayName,
        emailValue: row.email ?? "",
        status: formatRecordsEmploymentStatusLabel(row.employmentStatus),
        email: maskHrEmployeeSensitiveEmail(row.email, canViewSensitive),
        department: row.departmentName ?? "—",
        position: row.positionTitle ?? "—",
        manager: row.managerDisplayName ?? "—",
        startDate: row.employmentStartDate?.toISOString() ?? "",
      },
      cellKinds: {
        status: {
          kind: "badge",
          tone:
            row.employmentStatus === "suspended" ||
            row.employmentStatus === "terminated"
              ? "attention"
              : "default",
        },
      },
      rowHref: hrEmployeeDetailRoutePath(row.id),
      trailingAction: resolveRecordsListTrailingAction(canWrite),
    })),
  });
}
