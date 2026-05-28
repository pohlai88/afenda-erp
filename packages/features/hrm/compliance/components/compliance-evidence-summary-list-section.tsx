import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  buildComplianceEvidenceDetailSummaryListSurfaceConfiguration,
  type ComplianceEvidenceDetailSummaryRow,
} from "../data/compliance-list-surface.server"

type ComplianceEvidenceSummaryListSectionProps = {
  rows: readonly ComplianceEvidenceDetailSummaryRow[]
}

export async function ComplianceEvidenceSummaryListSection({
  rows,
}: ComplianceEvidenceSummaryListSectionProps) {
  const t = await getTranslations("Erp.Hrm.compliance.timeline")

  const listConfiguration =
    buildComplianceEvidenceDetailSummaryListSurfaceConfiguration(rows, {
      empty: t("summaryEmpty"),
      colField: t("summaryColField"),
      colValue: t("summaryColValue"),
    })

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:compliance:evidence-detail-summary"
      resolveConfiguredPermission={false}
    />
  )
}
