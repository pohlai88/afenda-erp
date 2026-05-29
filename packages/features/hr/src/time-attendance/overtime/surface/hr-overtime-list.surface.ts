import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrOvertimeRequestRow } from "../contracts/hr-overtime.contract";
import { hrOvertimeSurfaceKey, hrOvertimeUiCopy } from "./hr-overtime-ui.copy.shared";

const STATUS_BADGE: Record<
  HrOvertimeRequestRow["status"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  pending: { kind: "badge", tone: "attention" },
  approved: { kind: "badge", tone: "positive" },
  rejected: { kind: "badge", tone: "critical" },
  cancelled: { kind: "badge", tone: "default" },
};

const OVERTIME_COLUMNS = [
  { id: "employee", header: "Employee", priority: "primary" as const, minWidth: 200 },
  { id: "employeeNumber", header: "Number", minWidth: 100 },
  { id: "overtimeType", header: "Type", minWidth: 120 },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 110,
  },
  { id: "workDate", header: "Work date", minWidth: 140 },
  { id: "hours", header: "Hours", minWidth: 80 },
  { id: "reason", header: "Reason", minWidth: 200 },
  { id: "submittedAt", header: "Submitted", minWidth: 160 },
] as const;

export function buildHrOvertimeListSurface(input: {
  window: {
    rows: readonly HrOvertimeRequestRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrOvertimeUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "overtimeQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["overtimeQ", "status"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "overtime",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrOvertimeUiCopy.section.title,
        description: hrOvertimeUiCopy.section.description,
      },
      columnsId: "hr-time-attendance-overtime",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...OVERTIME_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/employees/${row.employeeId}`,
      cells: {
        employee: row.employeeDisplayName,
        employeeNumber: row.employeeNumber,
        overtimeType: row.overtimeType,
        status: row.status,
        workDate: formatErpDateTime(row.workDate),
        hours: row.hours,
        reason: row.reason ?? "—",
        submittedAt: formatErpDateTime(row.submittedAt),
      },
      cellKinds: {
        status: STATUS_BADGE[row.status],
      },
    })),
  });
}

export { hrOvertimeSurfaceKey };
