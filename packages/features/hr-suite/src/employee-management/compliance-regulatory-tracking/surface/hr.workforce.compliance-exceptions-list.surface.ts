import {
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrComplianceExceptionWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "../contracts/hr.workforce.compliance-route.contract";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolveComplianceExceptionRowTone,
  resolveComplianceExceptionSeverityBadgeTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export const hrComplianceExceptionsSurfaceKey =
  "hr.workforce.compliance.exceptions.list";

export const hrComplianceExceptionSearchParam = "complianceExceptionSearch";

export function buildHrComplianceExceptionsListSurface(input: {
  window: HrComplianceExceptionWindow;
  searchValue?: string;
  canWrite?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const { window, searchValue, canWrite = false } = input;
  const copy = hrComplianceUiCopy.exceptions;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "title",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceExceptionSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: searchValue,
    }),
    window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: "hr.workforce.compliance.exceptions",
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "title",
        header: copy.colTitle,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 240,
        cellKind: { kind: "link" },
      },
      { id: "employee", header: copy.colEmployee },
      {
        id: "area",
        header: copy.colArea,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "severity",
        header: copy.colSeverity,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
      },
      { id: "dueDate", header: copy.colDue, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => {
      const employeeHref = row.employeeId
        ? hrEmployeeDetailRoutePath(row.employeeId)
        : undefined;

      return {
        id: row.id,
        rowTone: resolveComplianceExceptionRowTone({
          severity: row.severity,
          status: row.status,
        }),
        rowHref: employeeHref,
        linkColumnId: employeeHref ? "title" : undefined,
        cells: {
          title: row.title,
          employee: formatComplianceEmployeeListCell({
            employeeNumber: row.employeeNumber,
            employeeDisplayName: row.employeeDisplayName,
            style: "name-first",
          }),
          area: formatComplianceListEnumCell(row.complianceArea),
          severity: formatComplianceListEnumCell(row.severity),
          status: formatComplianceListEnumCell(row.status),
          dueDate: row.correctiveActionDueDate?.toISOString() ?? "",
        },
        cellKinds: {
          severity: {
            kind: "badge",
            tone: resolveComplianceExceptionSeverityBadgeTone(row.severity),
          },
        },
        trailingAction: canWrite
          ? resolveListSurfaceRowTrailingAction({
              visible:
                row.status === "open" || row.status === "in_progress",
              allowed:
                row.status === "open" || row.status === "in_progress",
              disabledReason: copy.trailingClosedDisabledReason,
            })
          : undefined,
      };
    }),
  });
}
