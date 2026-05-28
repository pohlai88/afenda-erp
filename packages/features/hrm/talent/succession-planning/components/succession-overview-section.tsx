import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import { summarizeSuccessionOrgOverview } from "../data/succession-overview.server"
import {
  buildSuccessionOverviewStatConfiguration,
  SUCCESSION_STAT_SURFACE_KEY,
} from "../data/succession-surface-builders.server"

export async function SuccessionOverviewSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.successionPlanning")
  const summary = await summarizeSuccessionOrgOverview(organizationId)

  const statConfiguration = buildSuccessionOverviewStatConfiguration(summary, {
    activeCriticalRoles: t("kpiActiveCriticalRoles"),
    activeNominations: t("kpiActiveNominations"),
    talentPools: t("kpiTalentPools"),
    openReviewCycles: t("kpiOpenReviewCycles"),
    rolesWithoutReadySuccessor: t("kpiRolesWithoutReadySuccessor"),
    highRiskRoles: t("kpiHighRiskRoles"),
  })

  return (
    <div id="succession-overview-section" data-testid="succession-overview-section">
      <GovernedPatternBStatSection
        title={t("overviewTitle")}
        description={t("overviewDescription")}
        surfaceKey={SUCCESSION_STAT_SURFACE_KEY}
        statGroups={[{ groupKey: "overview", configuration: statConfiguration }]}
      />
    </div>
  )
}
