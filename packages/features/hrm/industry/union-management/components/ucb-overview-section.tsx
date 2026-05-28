import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import { summarizeUcbOrgOverview } from "../data/ucb-overview.server"
import {
  buildUcbOverviewStatConfiguration,
  UCB_STAT_SURFACE_KEY,
} from "../data/ucb-surface-builders.server"

export async function UcbOverviewSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const summary = await summarizeUcbOrgOverview(organizationId)

  const statConfiguration = buildUcbOverviewStatConfiguration(summary, {
    activeUnions: t("kpiActiveUnions"),
    activeAgreements: t("kpiActiveAgreements"),
    activeMemberships: t("kpiActiveMemberships"),
    openGrievances: t("kpiOpenGrievances"),
    expiringAgreements: t("kpiExpiringAgreements"),
    unresolvedCompliance: t("kpiUnresolvedCompliance"),
  })

  return (
    <div id="ucb-overview-section" data-testid="ucb-overview-section">
      <GovernedPatternBStatSection
        title={t("overviewTitle")}
        description={t("overviewDescription")}
        surfaceKey={UCB_STAT_SURFACE_KEY}
        statGroups={[{ groupKey: "overview", configuration: statConfiguration }]}
      />
    </div>
  )
}
