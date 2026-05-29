import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import {
  buildFhcComplianceKpiStatConfiguration,
  FHC_STAT_SURFACE_KEY,
} from "../data/fhc-surface-builders.server"
import { summarizeFhcOrgCompliance } from "../data/fhc-overview.server"

export async function FhcOverviewSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.foodHandlerCompliance")
  const summary = await summarizeFhcOrgCompliance(organizationId)

  const statConfiguration = buildFhcComplianceKpiStatConfiguration(summary, {
    compliant: t("kpiCompliant"),
    pending: t("kpiPending"),
    missing: t("kpiMissing"),
    expiring: t("kpiExpiring"),
    expired: t("kpiExpired"),
    queue: t("kpiRejected"),
  })

  return (
    <div data-testid="fhc-overview-section">
      <GovernedPatternBStatSection
        title={t("overviewTitle")}
        description={t("overviewDescription")}
        surfaceKey={FHC_STAT_SURFACE_KEY}
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
