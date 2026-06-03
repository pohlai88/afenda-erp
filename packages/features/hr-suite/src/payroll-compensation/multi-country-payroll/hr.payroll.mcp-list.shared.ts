import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import { hrPayrollMcpReadPermission } from "./hr.payroll.mcp.contract";

export type McpListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

type McpListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type McpListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildMcpListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return buildHrSuiteListSearchToolbar(input);
}

export function formatMcpEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildMcpOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildMcpListSearchToolbar>;
  window: McpListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: McpListColumn[];
  rows: McpListRow[];
}) {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrPayrollMcpReadPermission,
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
