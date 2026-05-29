import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockPayrollReferenceFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockPayrollReferenceRow } from "../data/tci-payroll-reference.server"
import type { TciPayrollExposureStatus } from "../tci-payroll-reference.shared"

export async function TimeClockPayrollReferenceFindingsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockPayrollReferenceRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.payrollReferenceFindings")
  const tExposure = await getTranslations(
    "Erp.Hrm.timeClock.payrollExposureStatusLabels"
  )

  const listConfiguration =
    buildTimeClockPayrollReferenceFindingsListSurfaceConfiguration(
      rows,
      {
        empty: t("empty"),
        colDate: t("colDate"),
        colEmployee: t("colEmployee"),
        colPunches: t("colPunches"),
        colWorkedMinutes: t("colWorkedMinutes"),
        colExposure: t("colExposure"),
        formatExposure: (status) =>
          tExposure(status as TciPayrollExposureStatus),
      },
      { orgSlug }
    )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:payroll-reference-findings"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
