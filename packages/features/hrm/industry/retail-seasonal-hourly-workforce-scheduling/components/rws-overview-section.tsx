import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import { summarizeRwsOrgOverview } from "../data/rws-overview.server"
import { buildRwsOrgOverviewStatConfiguration } from "../data/rws-surface-builders.server"
import { RWS_STAT_SURFACE_KEY } from "../data/rws-surface-metadata.shared"

export async function RwsOverviewSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")
  const summary = await summarizeRwsOrgOverview(organizationId)

  const kpiConfiguration = buildRwsOrgOverviewStatConfiguration(summary, {
    activeStores: t("kpiActiveStores"),
    draftPeriods: t("kpiDraftPeriods"),
    publishedPeriods: t("kpiPublishedPeriods"),
    openShiftOffers: t("kpiOpenShiftOffers"),
    understaffedSlots: t("kpiUnderstaffedSlots"),
  })

  return (
    <div data-testid="rws-overview-section">
      <GovernedPatternBStatSection
        title={t("overviewTitle")}
        description={t("overviewDescription")}
        surfaceKey={RWS_STAT_SURFACE_KEY}
        statGroups={[{ groupKey: "overview", configuration: kpiConfiguration }]}
      />
    </div>
  )
}
