import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import { summarizeFrmOrgOverview } from "../data/frm-overview.server"
import { buildFrmOverviewKpiStatConfiguration } from "../data/frm-surface-builders.server"
import { FRM_STAT_SURFACE_KEY } from "../data/frm-surface-metadata.shared"

export async function FrmOverviewSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.fieldWorkforce")
  const summary = await summarizeFrmOrgOverview(organizationId)
  const configuration = buildFrmOverviewKpiStatConfiguration(summary, {
    activeAssignments: t("kpiActiveAssignments"),
    openExceptions: t("kpiOpenExceptions"),
    activeTravel: t("kpiActiveTravel"),
    nonCompliantTravel: t("kpiNonCompliantTravel"),
  })

  return (
    <div data-testid="frm-overview-section">
      <GovernedPatternBStatSection
        title={t("overviewTitle")}
        surfaceKey={FRM_STAT_SURFACE_KEY}
        statGroups={[
          {
            groupKey: "overview",
            configuration,
          },
        ]}
      />
    </div>
  )
}
