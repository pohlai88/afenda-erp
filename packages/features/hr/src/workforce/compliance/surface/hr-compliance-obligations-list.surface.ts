import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrComplianceObligationRow } from "../contracts/hr-compliance.contract";
import {
  hrComplianceObligationsSurfaceKey,
  hrComplianceUiCopy,
} from "./hr-compliance-ui.copy.shared";

const OBLIGATION_COLUMNS = [
  { id: "code", header: "Code", priority: "primary" as const, minWidth: 120 },
  { id: "title", header: "Title", minWidth: 200 },
  { id: "complianceArea", header: "Area", minWidth: 140 },
  { id: "requirementKind", header: "Kind", minWidth: 140 },
  { id: "department", header: "Department", minWidth: 140 },
  { id: "dueDate", header: "Due", minWidth: 140 },
] as const;

export function buildHrComplianceObligationsListSurface(input: {
  window: {
    rows: readonly HrComplianceObligationRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const listCopy = hrComplianceUiCopy.obligations.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "obligationsQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["obligationsQ"],
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
        title: hrComplianceUiCopy.obligations.section.title,
        description: hrComplianceUiCopy.obligations.section.description,
      },
      columnsId: "hr-workforce-compliance-obligations",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...OBLIGATION_COLUMNS],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        title: row.title,
        complianceArea: row.complianceArea,
        requirementKind: row.requirementKind,
        department: row.departmentName ?? "—",
        dueDate: row.dueDate ? formatErpDateTime(row.dueDate) : "—",
      },
    })),
  });
}

export { hrComplianceObligationsSurfaceKey };
