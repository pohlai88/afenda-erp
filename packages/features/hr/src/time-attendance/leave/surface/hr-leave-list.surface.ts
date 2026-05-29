import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrLeaveRequestRow } from "../contracts/hr-leave.contract";
import { hrLeaveSurfaceKey, hrLeaveUiCopy } from "./hr-leave-ui.copy.shared";

const STATUS_BADGE: Record<
  HrLeaveRequestRow["status"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  pending: { kind: "badge", tone: "attention" },
  approved: { kind: "badge", tone: "positive" },
  rejected: { kind: "badge", tone: "critical" },
  cancelled: { kind: "badge", tone: "default" },
};

const LEAVE_COLUMNS = [
  { id: "employee", header: "Employee", priority: "primary" as const, minWidth: 200 },
  { id: "employeeNumber", header: "Number", minWidth: 100 },
  { id: "leaveType", header: "Type", minWidth: 120 },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 110,
  },
  { id: "startAt", header: "Start", minWidth: 140 },
  { id: "endAt", header: "End", minWidth: 140 },
  { id: "durationDays", header: "Days", minWidth: 80 },
  { id: "reason", header: "Reason", minWidth: 200 },
  { id: "submittedAt", header: "Submitted", minWidth: 160 },
] as const;

export function buildHrLeaveListSurface(input: {
  window: {
    rows: readonly HrLeaveRequestRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrLeaveUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "leaveQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["leaveQ", "status"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "leave",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrLeaveUiCopy.section.title,
        description: hrLeaveUiCopy.section.description,
      },
      columnsId: "hr-time-attendance-leave",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...LEAVE_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/employees/${row.employeeId}`,
      cells: {
        employee: row.employeeDisplayName,
        employeeNumber: row.employeeNumber,
        leaveType: row.leaveType,
        status: row.status,
        startAt: formatErpDateTime(row.startAt),
        endAt: formatErpDateTime(row.endAt),
        durationDays: row.durationDays,
        reason: row.reason ?? "—",
        submittedAt: formatErpDateTime(row.submittedAt),
      },
      cellKinds: {
        status: STATUS_BADGE[row.status],
      },
    })),
  });
}

export { hrLeaveSurfaceKey };
