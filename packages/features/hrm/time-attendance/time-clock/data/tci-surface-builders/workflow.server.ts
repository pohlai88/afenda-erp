import "server-only"

import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { TCI_LIST_SURFACE_IDS } from "../tci-surface-metadata.shared"
import {
  formatTciEmployeeCell,
  buildTciListSurface,
  TCI_READ_PERMISSION,
  tciEmployeeRowLinkFields,
  tciListHeader,
} from "./_shared.server"
import type { TimeClockCorrectionWorkflowRow } from "../tci-correction-workflow.server"

export function buildTimeClockCorrectionWorkflowListSurfaceConfiguration(
  rows: readonly TimeClockCorrectionWorkflowRow[],
  copy: {
    empty: string
    colDate: string
    colEmployee: string
    colCategory: string
    colStep: string
    colSummary: string
    formatCategory: (category: string) => string
    formatStep: (step: string) => string
    decideLabel: string
    correctLabel: string
  },
  options: { canDecide: boolean; canCorrect: boolean; orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.correctionWorkflow
  const stepColumnTone = rows.some(
    (row) =>
      row.workflowStep === "needs_decision" ||
      row.workflowStep === "needs_lam_correction"
  )
    ? "attention"
    : "default"
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "attendanceDate",
        header: copy.colDate,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options.orgSlug ? { kind: "link" } : undefined,
      },
      {
        id: "category",
        header: copy.colCategory,
        cellKind: { kind: "badge", tone: "attention" },
      },
      {
        id: "step",
        header: copy.colStep,
        cellKind: { kind: "badge", tone: stepColumnTone },
      },
      { id: "summary", header: copy.colSummary },
    ],
    rows: rows.map((row) => {
      const showDecide =
        options.canDecide &&
        row.workflowStep === "needs_decision" &&
        row.exceptionId != null
      const showCorrect =
        options.canCorrect &&
        row.anchorEventId != null &&
        row.anchorOccurredAt != null &&
        (row.workflowStep === "needs_lam_correction" ||
          row.workflowStep === "lam_snapshot_correct")

      const trailingAction =
        showDecide || showCorrect
          ? resolveListSurfaceRowTrailingAction({
              allowed: true,
              descriptor: {
                id: showDecide
                  ? "erp.hrm.time_clock.correction.decide"
                  : "erp.hrm.attendance.correction",
                label: showDecide ? copy.decideLabel : copy.correctLabel,
                intent: showDecide ? "approval" : "default",
              },
            })
          : listSurfaceRowTrailingActionHidden()

      return {
        id: row.id,
        cells: {
          attendanceDate: row.attendanceDate,
          employee: formatTciEmployeeCell(row),
          category: copy.formatCategory(row.category),
          step: copy.formatStep(row.workflowStep),
          summary: row.summary,
        },
        ...tciEmployeeRowLinkFields(options.orgSlug, row),
        trailingAction,
      }
    }),
  })
}
