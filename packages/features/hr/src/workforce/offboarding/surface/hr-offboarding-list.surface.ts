import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrOffboardingCaseRow } from "../contracts/hr-offboarding.contract";
import {
  hrOffboardingSurfaceKey,
  hrOffboardingUiCopy,
} from "./hr-offboarding-ui.copy.shared";

const STATUS_BADGE: Record<
  HrOffboardingCaseRow["status"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  in_progress: { kind: "badge", tone: "attention" },
  completed: { kind: "badge", tone: "positive" },
  cancelled: { kind: "badge", tone: "default" },
};

const OFFBOARDING_COLUMNS = [
  { id: "employee", header: "Employee", priority: "primary" as const, minWidth: 200 },
  { id: "employeeNumber", header: "Number", minWidth: 100 },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 120,
  },
  { id: "lastWorking", header: "Last working", minWidth: 140 },
  { id: "startedAt", header: "Started", minWidth: 160 },
  { id: "reason", header: "Reason", minWidth: 200 },
] as const;

export function buildHrOffboardingListSurface(input: {
  window: {
    rows: readonly HrOffboardingCaseRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrOffboardingUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "offboardingQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["offboardingQ", "status"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "offboarding",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrOffboardingUiCopy.section.title,
        description: hrOffboardingUiCopy.section.description,
      },
      columnsId: "hr-workforce-offboarding",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...OFFBOARDING_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/employees/${row.employeeId}`,
      cells: {
        employee: row.employeeDisplayName,
        employeeNumber: row.employeeNumber,
        status: row.status,
        lastWorking: row.lastWorkingDate
          ? formatErpDateTime(row.lastWorkingDate)
          : "—",
        startedAt: formatErpDateTime(row.startedAt),
        reason: row.reason ?? "—",
      },
      cellKinds: {
        status: STATUS_BADGE[row.status],
      },
    })),
  });
}

export { hrOffboardingSurfaceKey };
