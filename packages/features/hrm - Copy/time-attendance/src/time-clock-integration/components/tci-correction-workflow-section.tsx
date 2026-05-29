import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildTimeClockCorrectionWorkflowListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockCorrectionWorkflowRow } from "../data/tci-correction-workflow.server"
import type {
  TciCorrectionCategory,
  TciCorrectionWorkflowStep,
} from "../tci-correction-workflow.shared"

import { TciCorrectionWorkflowTrailingCell } from "./tci-list-trailing-cells.client"

export async function TimeClockCorrectionWorkflowSection({
  rows,
  orgSlug,
  canDecide,
  canCorrectAttendance,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockCorrectionWorkflowRow[]
  orgSlug?: string
  canDecide: boolean
  canCorrectAttendance: boolean
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.correctionWorkflow")
  const tCategory = await getTranslations(
    "Erp.Hrm.timeClock.correctionCategoryLabels"
  )
  const tStep = await getTranslations(
    "Erp.Hrm.timeClock.correctionWorkflowStepLabels"
  )

  const listConfiguration =
    buildTimeClockCorrectionWorkflowListSurfaceConfiguration(
      rows,
      {
        empty: t("empty"),
        colDate: t("colDate"),
        colEmployee: t("colEmployee"),
        colCategory: t("colCategory"),
        colStep: t("colStep"),
        colSummary: t("colSummary"),
        formatCategory: (category) =>
          tCategory(category as TciCorrectionCategory),
        formatStep: (step) => tStep(step as TciCorrectionWorkflowStep),
        decideLabel: t("decideAction"),
        correctLabel: t("correctAction"),
      },
      { canDecide, canCorrect: canCorrectAttendance, orgSlug }
    )

  return (
    <GovernedPatternCListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:correction-workflow"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
      trailingColumn={{
        header: t("colActions"),
        Cell: TciCorrectionWorkflowTrailingCell,
        context: {
          canDecide,
          canCorrectAttendance,
          rows: rows.map((row) => ({
            id: row.id,
            workflowStep: row.workflowStep,
            exceptionId: row.exceptionId,
            resolvedEventId: row.resolvedEventId,
            anchorEventId: row.anchorEventId,
            anchorOccurredAtIso: row.anchorOccurredAt?.toISOString() ?? null,
            anchorEventType: row.anchorEventType,
          })),
        },
      }}
    />
  )
}
