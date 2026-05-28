import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { organizationHrmComplianceDetailPath } from "../../_core/shared"
import { compliancePackTypeLabel } from "../data/compliance-pack-labels.shared"
import { buildComplianceHealthSamplesListSurfaceConfiguration } from "../data/compliance-list-surface.server"
import {
  highestComplianceAgingTier,
  type ComplianceHealthAttentionBucket,
} from "../data/compliance-operational-health.shared"
import type { ComplianceHealthSampleRow } from "../data/compliance-operational-health.queries.server"
import { ComplianceHealthSamplesTrailingCell } from "./compliance-list-trailing-cells.client"

type ComplianceHealthSamplesListSectionProps = {
  bucket: ComplianceHealthAttentionBucket
  samples: readonly ComplianceHealthSampleRow[]
  orgSlug: string
}

export async function ComplianceHealthSamplesListSection({
  bucket,
  samples,
  orgSlug,
}: ComplianceHealthSamplesListSectionProps) {
  const t = await getTranslations("Erp.Hrm.compliance.operationalHealth")

  const listConfiguration =
    buildComplianceHealthSamplesListSurfaceConfiguration(
      bucket,
      samples,
      orgSlug,
      {
        empty: t("samplesEmpty"),
        colPack: t("colPack"),
        colPeriod: t("colPeriod"),
        colAge: t("colAge"),
        colTier: t("colTier"),
        packLabelFor: compliancePackTypeLabel,
        formatPeriod: (row) =>
          row.periodStart && row.periodEnd
            ? `${row.periodStart} → ${row.periodEnd}`
            : "—",
        ageLabelFor: (ageDays) =>
          ageDays === 0 ? t("ageToday") : t("ageDays", { days: ageDays }),
        tierLabelFor: (sampleBucket, row) => {
          if (sampleBucket !== "needs_attention_stuck") return "—"
          const tier = highestComplianceAgingTier(row.ageDays)
          if (tier === "detected") return t("agingTier.detected")
          if (tier === "escalated") return t("agingTier.escalated")
          return t("agingTier.critical")
        },
      }
    )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey={`hrm:compliance:health-samples:${bucket}`}
      trailingColumn={{
        header: t("inspect"),
        Cell: ComplianceHealthSamplesTrailingCell,
        context: {
          rowById: Object.fromEntries(
            samples.map((sample) => {
              const label = compliancePackTypeLabel(sample.packType)
              return [
                sample.id,
                {
                  id: sample.id,
                  inspectHref: organizationHrmComplianceDetailPath(
                    orgSlug,
                    sample.id
                  ),
                  inspectLabel: t("inspect"),
                  inspectAria: t("inspectTimelineAria", { pack: label }),
                },
              ]
            })
          ),
        },
      }}
    />
  )
}
