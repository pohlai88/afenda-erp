import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import type { HrLamPayrollReferenceRow } from "@afenda/db";

import {
  buildLamListSearchToolbar,
  buildLamOperationalListSurface,
  formatLamEmployeeListCell,
  formatLamEnumCell,
} from "./hr.time.lam-list.shared";
import { hrLamUiCopy } from "./hr.time.lam-ui.copy.shared";
import { hrLamPayrollRefsColumnsId } from "./hr.time.lam-surface-metadata.shared";

export const hrLamPayrollRefsSurfaceKey = "hr.time.lam.payroll-refs.list";

export function buildHrLamPayrollRefsListSurface(input: {
  rows: readonly HrLamPayrollReferenceRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrLamUiCopy.payrollRefs;

  return buildLamOperationalListSurface({
    primaryColumnId: "employee",
    searchToolbar: buildLamListSearchToolbar({
      param: "lamPayrollRefsSearch",
      label: copy.sectionTitle,
      placeholder: "Reference or employee",
    }),
    window: {
      pageSize: input.rows.length,
      totalCount: input.rows.length,
      hasNextPage: false,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrLamPayrollRefsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employee", header: copy.colEmployee, priority: "primary", pin: "start" },
      { id: "source", header: copy.colSource },
      { id: "kind", header: copy.colKind },
      { id: "reference", header: copy.colReference, wrap: true },
      {
        id: "ready",
        header: copy.colReady,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: input.rows.map((row) => ({
      id: row.referenceId,
      cells: {
        employee: formatLamEmployeeListCell({
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.employeeDisplayName,
        }),
        source: formatLamEnumCell(row.source),
        kind: formatLamEnumCell(row.kind),
        reference: row.referenceId,
        ready: row.readyForPayroll ? "Ready" : "Blocked",
      },
    })),
  });
}
