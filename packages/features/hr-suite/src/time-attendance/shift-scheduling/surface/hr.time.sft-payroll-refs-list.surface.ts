import type { HrShiftPayrollReferenceRow } from "@afenda/db";

import {
  buildSftListSearchToolbar,
  buildSftOperationalListSurface,
  formatSftPayrollRefKind,
} from "./hr.time.sft-list.shared";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";
import {
  hrSftPayrollRefsColumnsId,
  hrSftPayrollRefsSearchParam,
  hrSftPayrollRefsSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";

export { hrSftPayrollRefsSurfaceKey };

export type HrSftPayrollRefsWindow = {
  rows: readonly HrShiftPayrollReferenceRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function buildHrSftPayrollRefsListSurface(input: {
  window: HrSftPayrollRefsWindow;
  searchValue?: string;
}) {
  const copy = hrSftUiCopy.payrollRefs;

  return buildSftOperationalListSurface({
    surfaceKey: hrSftPayrollRefsSurfaceKey,
    primaryColumnId: "employee",
    searchToolbar: buildSftListSearchToolbar({
      param: hrSftPayrollRefsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSftPayrollRefsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        pin: "start",
        priority: "primary",
      },
      { id: "kind", header: copy.colKind },
      { id: "shift", header: copy.colShift },
      { id: "ready", header: copy.colReady },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.referenceId,
      cells: {
        employee: `${row.employeeDisplayName} (${row.employeeNumber})`,
        kind: formatSftPayrollRefKind(row.kind),
        shift: `${row.templateCode} · ${row.shiftDate.toISOString().slice(0, 10)}`,
        ready: row.readyForPayroll ? "Yes" : "No",
      },
    })),
  });
}
