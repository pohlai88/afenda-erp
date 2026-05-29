import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { buildTimeClockExceptionsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockExceptionRow } from "../data/tci.queries.server"
import type {
  TciDetectionOutcome,
  TciPunchEventType,
} from "../schemas/tci-workflow-state.shared"

import { TciExceptionTrailingCell } from "./tci-list-trailing-cells.client"

export async function TimeClockExceptionsSection({
  rows,
  orgSlug,
  canDecide,
  canCorrectAttendance,
  parentAccessAllowed = true,
  loadError,
  workbenchFocus,
}: {
  rows: readonly TimeClockExceptionRow[]
  orgSlug?: string
  canDecide: boolean
  canCorrectAttendance: boolean
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
  workbenchFocus?: string | null
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.exceptions")
  const tClass = await getTranslations("Erp.Hrm.timeClock")

  const listConfiguration = buildTimeClockExceptionsListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colEmployee: t("colEmployee"),
      colDevice: t("colDevice"),
      colEvent: t("colEvent"),
      colOutcome: t("colOutcome"),
      colOccurred: t("colOccurred"),
      formatDetectionOutcome: (outcome) =>
        t(`detectionOutcomeLabels.${outcome as TciDetectionOutcome}`),
      formatEventType: (eventType) =>
        tClass(`classifiedEventTypeLabels.${eventType as TciPunchEventType}`),
      decideLabel: t("decideAction"),
      correctLabel: t("correctAction"),
    },
    {
      canDecide,
      canCorrect: canCorrectAttendance,
      orgSlug,
      workbenchFocusSearch: {
        label: t("toolbarSearchLabel"),
        placeholder: t("toolbarSearchPlaceholder"),
        value: workbenchFocus,
      },
    }
  )

  return (
    <GovernedPatternCListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:exceptions"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
      trailingColumn={{
        header: t("colActions"),
        Cell: TciExceptionTrailingCell,
        context: {
          canDecide,
          canCorrectAttendance,
          rows: rows.map((row) => ({
            id: row.id,
            state: row.state,
            resolvedEventId: row.resolvedEventId,
            occurredAtIso: row.occurredAt.toISOString(),
            eventType: row.eventType,
          })),
        },
      }}
    />
  )
}
