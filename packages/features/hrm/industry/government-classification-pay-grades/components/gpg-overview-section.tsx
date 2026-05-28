import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import { summarizeGpgOrgOverview } from "../data/gpg-org-overview.server"
import { buildGpgOrgOverviewStatConfiguration } from "../data/gpg-surface-builders.server"
import { GPG_STAT_SURFACE_KEY } from "../data/gpg-surface-metadata.shared"

export async function GpgOverviewSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")
  const summary = await summarizeGpgOrgOverview(organizationId)

  const kpiConfiguration = buildGpgOrgOverviewStatConfiguration(summary, {
    activeAssignments: t("gpgActiveAssignments"),
    distinctPayGrades: t("gpgDistinctPayGrades"),
    activeLocalityRules: t("gpgActiveLocalityRules"),
    pendingStepEvents: t("gpgPendingStepEvents"),
    appliedMovements: t("gpgAppliedMovements"),
  })

  return (
    <div data-testid="gpg-overview-section">
      <GovernedPatternBStatSection
        title={t("overviewTitle")}
        description={t("overviewDescription")}
        surfaceKey={GPG_STAT_SURFACE_KEY}
        statGroups={[
          {
            groupKey: "overview",
            configuration: kpiConfiguration,
          },
        ]}
      />
    </div>
  )
}
