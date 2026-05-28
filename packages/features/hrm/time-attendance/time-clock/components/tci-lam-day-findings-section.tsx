import { getTranslations } from "next-intl/server"

import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface"
import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TciListSurfaceId } from "../data/tci-surface-metadata.shared"

export type TimeClockLamDayFindingRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly codes: readonly string[]
  readonly summary: string
}

type LamDayFindingsListCopy = {
  empty: string
  colDate: string
  colEmployee: string
  colCodes: string
  formatCode: (code: string) => string
}

export type TimeClockLamDayFindingsSectionConfig<
  TRow extends TimeClockLamDayFindingRow = TimeClockLamDayFindingRow,
> = {
  readonly messageNamespace:
    | "Erp.Hrm.timeClock.missingPunchFindings"
    | "Erp.Hrm.timeClock.duplicatePunchFindings"
    | "Erp.Hrm.timeClock.abnormalPunchFindings"
  readonly codeLabelsNamespace:
    | "Erp.Hrm.timeClock.missingPunchCodeLabels"
    | "Erp.Hrm.timeClock.duplicateSequenceCodeLabels"
    | "Erp.Hrm.timeClock.abnormalPunchCodeLabels"
  readonly surfaceKey: TciListSurfaceId
  readonly buildListConfiguration: (
    rows: readonly TRow[],
    copy: LamDayFindingsListCopy,
    options?: { orgSlug?: string }
  ) => ListSurfaceRendererConfigurationInput
}

export async function renderTimeClockLamDayFindingsSection<
  TRow extends TimeClockLamDayFindingRow,
>({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
  config,
}: {
  rows: readonly TRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
  config: TimeClockLamDayFindingsSectionConfig<TRow>
}) {
  const t = await getTranslations(config.messageNamespace)
  const tCodes = await getTranslations(config.codeLabelsNamespace)

  const listConfiguration = config.buildListConfiguration(
    rows,
    {
      empty: t("empty"),
      colDate: t("colDate"),
      colEmployee: t("colEmployee"),
      colCodes: t("colCodes"),
      formatCode: (code) => tCodes(code as never),
    },
    { orgSlug }
  )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey={config.surfaceKey}
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
