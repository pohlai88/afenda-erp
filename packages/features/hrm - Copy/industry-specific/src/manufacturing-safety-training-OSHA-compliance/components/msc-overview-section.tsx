import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import {
  buildMscComplianceKpiStatConfiguration,
  MSC_STAT_SURFACE_KEY,
} from "../data/msc-surface-builders.server"
import type { MscOrgComplianceSummary } from "../data/msc-overview.server"

export async function MscOverviewSection({
  summary,
}: {
  summary: MscOrgComplianceSummary
}) {
  const t = await getTranslations("Erp.Hrm.manufacturingSafety")

  const statConfiguration = buildMscComplianceKpiStatConfiguration(summary, {
    compliant: t("kpiCompliant"),
    pending: t("kpiPending"),
    missing: t("kpiMissing"),
    expiring: t("kpiExpiring"),
    expired: t("kpiExpired"),
    flagged: t("kpiFlagged"),
  })

  return (
    <div data-testid="msc-overview-section">
      <GovernedPatternBStatSection
        title={t("overviewTitle")}
        description={t("overviewDescription")}
        surfaceKey={MSC_STAT_SURFACE_KEY}
        statGroups={[
          {
            groupKey: "compliance",
            configuration: statConfiguration,
          },
        ]}
      />
    </div>
  )
}
