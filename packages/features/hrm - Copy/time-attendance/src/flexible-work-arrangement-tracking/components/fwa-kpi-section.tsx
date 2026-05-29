import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import {
  buildFwaKpiStatConfiguration,
  FWA_STAT_SURFACE_KEY,
} from "../data/fwa-surface-builders.server"
import type {
  FwaListLoadError,
  FwaOrgSummaryCounts,
} from "../data/fwa.types.shared"

export async function FwaKpiSummarySection({
  summary,
  loadError,
}: {
  summary: FwaOrgSummaryCounts
  loadError?: FwaListLoadError
}) {
  const t = await getTranslations("Erp.Hrm.flexibleWork")

  const configuration = buildFwaKpiStatConfiguration(summary, {
    pending: t("kpiPending"),
    active: t("kpiActive"),
    types: t("kpiTypes"),
    expiring: t("kpiExpiring"),
    complianceGap: t("kpiComplianceGap"),
  })

  return (
    <GovernedPatternBStatSection
      title={t("kpiTitle")}
      surfaceKey={FWA_STAT_SURFACE_KEY}
      loadError={
        loadError
          ? {
              variant: "error",
              title: loadError.title,
              description: loadError.description,
            }
          : undefined
      }
      statGroups={[
        {
          groupKey: "summary",
          configuration,
        },
      ]}
    />
  )
}
