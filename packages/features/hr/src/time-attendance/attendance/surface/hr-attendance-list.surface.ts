import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrAttendanceRecordRow } from "../contracts/hr-attendance.contract";
import { hrAttendanceSurfaceKey, hrAttendanceUiCopy } from "./hr-attendance-ui.copy.shared";

const PUNCH_BADGE: Record<
  HrAttendanceRecordRow["punchType"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  clock_in: { kind: "badge", tone: "positive" },
  clock_out: { kind: "badge", tone: "default" },
};

const ATTENDANCE_COLUMNS = [
  { id: "employee", header: "Employee", priority: "primary" as const, minWidth: 200 },
  { id: "employeeNumber", header: "Number", minWidth: 100 },
  {
    id: "punchType",
    header: "Punch",
    cellKind: { kind: "badge" as const },
    minWidth: 110,
  },
  { id: "source", header: "Source", minWidth: 100 },
  { id: "punchedAt", header: "Punched at", minWidth: 160 },
  { id: "notes", header: "Notes", minWidth: 200 },
] as const;

export function buildHrAttendanceListSurface(input: {
  window: {
    rows: readonly HrAttendanceRecordRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrAttendanceUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "attendanceQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["attendanceQ"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "attendance",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrAttendanceUiCopy.section.title,
        description: hrAttendanceUiCopy.section.description,
      },
      columnsId: "hr-time-attendance-attendance",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...ATTENDANCE_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/employees/${row.employeeId}`,
      cells: {
        employee: row.employeeDisplayName,
        employeeNumber: row.employeeNumber,
        punchType: row.punchType === "clock_in" ? "Clock in" : "Clock out",
        source: row.source,
        punchedAt: formatErpDateTime(row.punchedAt),
        notes: row.notes ?? "—",
      },
      cellKinds: {
        punchType: PUNCH_BADGE[row.punchType],
      },
    })),
  });
}

export { hrAttendanceSurfaceKey };
