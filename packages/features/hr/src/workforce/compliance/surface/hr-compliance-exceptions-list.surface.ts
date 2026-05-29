import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrComplianceExceptionRow } from "../contracts/hr-compliance.contract";
import {
  hrComplianceExceptionsSurfaceKey,
  hrComplianceUiCopy,
} from "./hr-compliance-ui.copy.shared";

const SEVERITY_BADGE: Record<
  HrComplianceExceptionRow["severity"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  low: { kind: "badge", tone: "default" },
  medium: { kind: "badge", tone: "attention" },
  high: { kind: "badge", tone: "attention" },
  critical: { kind: "badge", tone: "critical" },
};

const STATUS_BADGE: Record<
  HrComplianceExceptionRow["status"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  open: { kind: "badge", tone: "attention" },
  in_progress: { kind: "badge", tone: "attention" },
  resolved: { kind: "badge", tone: "positive" },
  waived: { kind: "badge", tone: "default" },
};

const EXCEPTION_COLUMNS = [
  { id: "title", header: "Title", priority: "primary" as const, minWidth: 200 },
  { id: "complianceArea", header: "Area", minWidth: 140 },
  { id: "itemType", header: "Type", minWidth: 120 },
  {
    id: "severity",
    header: "Severity",
    cellKind: { kind: "badge" as const },
    minWidth: 110,
  },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 110,
  },
  { id: "employee", header: "Employee", minWidth: 160 },
  { id: "dueDate", header: "Corrective due", minWidth: 140 },
  { id: "createdAt", header: "Logged", minWidth: 160 },
] as const;

export function buildHrComplianceExceptionsListSurface(input: {
  window: {
    rows: readonly HrComplianceExceptionRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrComplianceUiCopy.exceptions.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "exceptionsQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["exceptionsQ", "exceptionStatus"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "compliance",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrComplianceUiCopy.exceptions.section.title,
        description: hrComplianceUiCopy.exceptions.section.description,
      },
      columnsId: "hr-workforce-compliance-exceptions",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...EXCEPTION_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: row.employeeId ? `/hr/employees/${row.employeeId}` : undefined,
      cells: {
        title: row.title,
        complianceArea: row.complianceArea,
        itemType: row.itemType,
        severity: row.severity,
        status: row.status,
        employee: row.employeeDisplayName ?? row.employeeNumber ?? "—",
        dueDate: row.correctiveActionDueDate
          ? formatErpDateTime(row.correctiveActionDueDate)
          : "—",
        createdAt: formatErpDateTime(row.createdAt),
      },
      cellKinds: {
        severity: SEVERITY_BADGE[row.severity],
        status: STATUS_BADGE[row.status],
      },
    })),
  });
}

export { hrComplianceExceptionsSurfaceKey };
