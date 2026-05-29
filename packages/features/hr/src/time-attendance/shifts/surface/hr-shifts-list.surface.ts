import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrShiftAssignmentRow } from "../contracts/hr-shifts.contract";
import { hrShiftsSurfaceKey, hrShiftsUiCopy } from "./hr-shifts-ui.copy.shared";

const STATUS_BADGE: Record<
  HrShiftAssignmentRow["status"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  scheduled: { kind: "badge", tone: "attention" },
  published: { kind: "badge", tone: "positive" },
  cancelled: { kind: "badge", tone: "default" },
};

const SHIFT_COLUMNS = [
  { id: "employee", header: "Employee", priority: "primary" as const, minWidth: 200 },
  { id: "employeeNumber", header: "Number", minWidth: 100 },
  { id: "template", header: "Template", minWidth: 140 },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 110,
  },
  { id: "shiftDate", header: "Date", minWidth: 120 },
  { id: "shiftStart", header: "Start", minWidth: 160 },
  { id: "shiftEnd", header: "End", minWidth: 160 },
  { id: "notes", header: "Notes", minWidth: 180 },
] as const;

export function buildHrShiftsListSurface(input: {
  window: {
    rows: readonly HrShiftAssignmentRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrShiftsUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "shiftsQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["shiftsQ", "status"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "shifts",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrShiftsUiCopy.section.title,
        description: hrShiftsUiCopy.section.description,
      },
      columnsId: "hr-time-attendance-shifts",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...SHIFT_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/employees/${row.employeeId}`,
      cells: {
        employee: row.employeeDisplayName,
        employeeNumber: row.employeeNumber,
        template: `${row.templateCode} — ${row.templateName}`,
        status: row.status,
        shiftDate: formatErpDateTime(row.shiftDate),
        shiftStart: formatErpDateTime(row.shiftStart),
        shiftEnd: formatErpDateTime(row.shiftEnd),
        notes: row.notes ?? "—",
      },
      cellKinds: {
        status: STATUS_BADGE[row.status],
      },
    })),
  });
}

export { hrShiftsSurfaceKey };
