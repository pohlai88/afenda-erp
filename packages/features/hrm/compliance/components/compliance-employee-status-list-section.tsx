import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildComplianceEmployeeStatusListSurfaceConfiguration } from "../data/compliance-list-surface.server"
import type { ComplianceOverviewRow } from "../data/compliance-overview.shared"

type ComplianceEmployeeStatusListSectionProps = {
  orgSlug: string
  rows: readonly ComplianceOverviewRow[]
  labels: {
    groupLabel: string
    summaryLabel: string
    summaryEmployeeCount: (count: number) => string
    summaryAttentionCount: (count: number) => string
    summaryOpenCount: (count: number) => string
  }
}

export async function ComplianceEmployeeStatusListSection({
  orgSlug,
  rows,
  labels,
}: ComplianceEmployeeStatusListSectionProps) {
  const t = await getTranslations("Erp.Hrm.compliance.employeeStatus")

  const listConfiguration =
    buildComplianceEmployeeStatusListSurfaceConfiguration(rows, orgSlug, {
      empty: t("empty"),
      groupLabel: labels.groupLabel,
      summaryLabel: labels.summaryLabel,
      summaryEmployeeCount: labels.summaryEmployeeCount,
      summaryAttentionCount: labels.summaryAttentionCount,
      summaryOpenCount: labels.summaryOpenCount,
      colEmployee: t("colEmployee"),
      colStatus: t("colStatus"),
      colOpen: t("colOpen"),
      colScope: t("colScope"),
      colSignals: t("colSignals"),
    })

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:compliance:employee-status"
    />
  )
}
