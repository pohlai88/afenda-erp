import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
} from "../../hr-suite-integration/metadata";
import { hrPayrollProcessingReadPermission } from "./hr.payroll.processing.contract";

export type PayrollListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

type PayrollListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type PayrollListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildPayrollListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return buildHrSuiteListSearchToolbar(input);
}

export function formatPayrollEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildPayrollOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildPayrollListSearchToolbar>;
  window: PayrollListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: PayrollListColumn[];
  rows: PayrollListRow[];
}) {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrPayrollProcessingReadPermission,
    searchToolbar: input.searchToolbar,
    window: input.window,
    surface: {
      headerTitle: input.surface.headerTitle,
      columnsId: input.surface.columnsId,
      rowKey: "id",
      emptyTitle: input.surface.emptyTitle,
      emptyDescription: input.surface.emptyDescription,
    },
    columns: input.columns,
    rows: input.rows,
  });
}
