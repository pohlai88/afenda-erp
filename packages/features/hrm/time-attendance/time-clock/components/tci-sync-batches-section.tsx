import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockSyncBatchesListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockSyncBatchRow } from "../data/tci.queries.server"
import type { TciSyncBatchState } from "../tci-automated-sync.shared"
import type { TciSyncSourceKind } from "../schemas/tci-workflow-state.shared"

export async function TimeClockSyncBatchesSection({
  rows,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockSyncBatchRow[]
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.syncBatches")

  const listConfiguration = buildTimeClockSyncBatchesListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colStarted: t("colStarted"),
      colFinished: t("colFinished"),
      colSource: t("colSource"),
      colDevice: t("colDevice"),
      colState: t("colState"),
      colReceived: t("colReceived"),
      colAccepted: t("colAccepted"),
      colDuplicates: t("colDuplicates"),
      colRejected: t("colRejected"),
      formatSourceKind: (sourceKind) =>
        t(`sourceKindLabels.${sourceKind as TciSyncSourceKind}`),
      formatBatchState: (state) =>
        t(`batchStateLabels.${state as TciSyncBatchState}`),
    }
  )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:sync-batches"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
