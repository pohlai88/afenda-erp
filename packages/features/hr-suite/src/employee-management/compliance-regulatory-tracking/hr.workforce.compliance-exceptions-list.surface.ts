import {
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { HrComplianceExceptionWindow } from "@afenda/db";

import { hrEmployeeDetailRoutePath } from "./hr.workforce.compliance-route.contract";
import { formatComplianceDateTimeLocalInput } from "./hr.workforce.compliance-form.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
  formatComplianceEmployeeListCell,
  formatComplianceListEnumCell,
  resolveComplianceExceptionGapBadgeTone,
  resolveComplianceExceptionRowTone,
  resolveComplianceExceptionSeverityBadgeTone,
  resolveComplianceExceptionStatusBadgeTone,
  deriveCorrectiveActionDuePosture,
  resolveCorrectiveActionDueBadgeTone,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceExceptionsColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
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
      columnsId: hrComplianceExceptionsColumnsId,
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
        id: "gap",
        header: copy.colGap,
        cellKind: { kind: "badge", tone: "attention" },
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
      { id: "owner", header: copy.colOwner },
      { id: "dueDate", header: copy.colDue, cellKind: { kind: "date" } },
    ],
    rows: window.rows.map((row) => {
      const employeeHref = row.employeeId
        ? hrEmployeeDetailRoutePath(row.employeeId)
        : undefined;
      const correctiveDuePosture = deriveCorrectiveActionDuePosture({
        status: row.status,
        correctiveActionDueDate: row.correctiveActionDueDate,
      });

      return {
        id: row.id,
        rowTone: resolveComplianceExceptionRowTone({
          severity: row.severity,
          status: row.status,
          gapKind: row.gapKind,
          correctiveActionDueDate: row.correctiveActionDueDate,
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
          gap: row.gapKind
            ? formatComplianceListEnumCell(row.gapKind)
            : formatComplianceListEnumCell(row.itemType),
          gapKindValue: row.gapKind ?? "",
          itemTypeValue: row.itemType,
          severity: formatComplianceListEnumCell(row.severity),
          status: formatComplianceListEnumCell(row.status),
          statusValue: row.status,
          owner: formatComplianceEmployeeListCell({
            employeeNumber: row.correctiveActionOwnerEmployeeNumber,
            employeeDisplayName: row.correctiveActionOwnerDisplayName,
            style: "name-first",
          }),
          correctiveActionOwnerEmployeeIdValue:
            row.correctiveActionOwnerEmployeeId ?? "",
          correctiveActionDescriptionValue: row.correctiveActionDescription ?? "",
          correctiveDuePostureValue: correctiveDuePosture ?? "",
          dueDate: row.correctiveActionDueDate?.toISOString() ?? "",
          correctiveActionDueDateInput: formatComplianceDateTimeLocalInput(
            row.correctiveActionDueDate,
          ),
          employeeIdValue: row.employeeId ?? "",
        },
        cellKinds: {
          gap: {
            kind: "badge",
            tone: resolveComplianceExceptionGapBadgeTone(row.gapKind),
          },
          severity: {
            kind: "badge",
            tone: resolveComplianceExceptionSeverityBadgeTone(row.severity),
          },
          status: {
            kind: "badge",
            tone: resolveComplianceExceptionStatusBadgeTone(row.status),
          },
          ...(correctiveDuePosture
            ? {
                dueDate: {
                  kind: "badge" as const,
                  tone: resolveCorrectiveActionDueBadgeTone(correctiveDuePosture),
                },
              }
            : undefined),
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
