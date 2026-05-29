import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrLifecycleOverviewRow } from "../contracts/hr-lifecycle.contract";
import {
  hrLifecycleSurfaceKey,
  hrLifecycleUiCopy,
} from "./hr-lifecycle-ui.copy.shared";

const STATUS_BADGE: Record<
  HrLifecycleOverviewRow["employmentStatus"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  onboarding: { kind: "badge", tone: "default" },
  active: { kind: "badge", tone: "positive" },
  probation: { kind: "badge", tone: "attention" },
  confirmed: { kind: "badge", tone: "positive" },
  suspended: { kind: "badge", tone: "critical" },
  notice_period: { kind: "badge", tone: "attention" },
  offboarding: { kind: "badge", tone: "attention" },
  terminated: { kind: "badge", tone: "critical" },
  separated: { kind: "badge", tone: "critical" },
  retired: { kind: "badge", tone: "default" },
  archived: { kind: "badge", tone: "default" },
};

const LIFECYCLE_COLUMNS = [
  {
    id: "employee",
    header: "Employee",
    priority: "primary" as const,
    minWidth: 200,
  },
  { id: "employeeNumber", header: "Number", minWidth: 100 },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 120,
  },
  { id: "probationEnd", header: "Probation end", minWidth: 140 },
  { id: "confirmed", header: "Confirmed", minWidth: 140 },
  { id: "pending", header: "Pending", minWidth: 90 },
  { id: "nextEffective", header: "Next effective", minWidth: 160 },
] as const;

export function buildHrLifecycleListSurface(input: {
  window: {
    rows: readonly HrLifecycleOverviewRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrLifecycleUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "lifecycleQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["lifecycleQ", "employmentStatus"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "lifecycle",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrLifecycleUiCopy.section.title,
        description: hrLifecycleUiCopy.section.description,
      },
      columnsId: "hr-workforce-lifecycle",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...LIFECYCLE_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/employees/${row.id}`,
      cells: {
        employee: row.displayName,
        employeeNumber: row.employeeNumber,
        status: row.employmentStatus,
        probationEnd: row.probationEndDate
          ? formatErpDateTime(row.probationEndDate)
          : "—",
        confirmed: row.confirmationDate
          ? formatErpDateTime(row.confirmationDate)
          : "—",
        pending: String(row.pendingTransitionCount),
        nextEffective: row.nextEffectiveDate
          ? formatErpDateTime(row.nextEffectiveDate)
          : "—",
      },
      cellKinds: {
        status: STATUS_BADGE[row.employmentStatus],
      },
    })),
  });
}

export { hrLifecycleSurfaceKey };
