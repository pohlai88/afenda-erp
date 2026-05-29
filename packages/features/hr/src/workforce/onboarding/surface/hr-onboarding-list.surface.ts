import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrOnboardingCaseRow } from "../contracts/hr-onboarding.contract";
import {
  hrOnboardingSurfaceKey,
  hrOnboardingUiCopy,
} from "./hr-onboarding-ui.copy.shared";

const STATUS_BADGE: Record<
  HrOnboardingCaseRow["status"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  in_progress: { kind: "badge", tone: "attention" },
  completed: { kind: "badge", tone: "positive" },
  cancelled: { kind: "badge", tone: "default" },
};

const ONBOARDING_COLUMNS = [
  { id: "employee", header: "Employee", priority: "primary" as const, minWidth: 200 },
  { id: "employeeNumber", header: "Number", minWidth: 100 },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 120,
  },
  { id: "targetStatus", header: "Target status", minWidth: 140 },
  { id: "startedAt", header: "Started", minWidth: 160 },
  { id: "reason", header: "Reason", minWidth: 200 },
] as const;

export function buildHrOnboardingListSurface(input: {
  window: {
    rows: readonly HrOnboardingCaseRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrOnboardingUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "onboardingQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["onboardingQ", "status"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "onboarding",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrOnboardingUiCopy.section.title,
        description: hrOnboardingUiCopy.section.description,
      },
      columnsId: "hr-workforce-Onboarding",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...ONBOARDING_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      rowHref: `/hr/employees/${row.employeeId}`,
      cells: {
        employee: row.employeeDisplayName,
        employeeNumber: row.employeeNumber,
        status: row.status,
        targetStatus: row.targetStatus,
        startedAt: formatErpDateTime(row.startedAt),
        reason: row.reason ?? "—",
      },
      cellKinds: {
        status: STATUS_BADGE[row.status],
      },
    })),
  });
}

export { hrOnboardingSurfaceKey };
