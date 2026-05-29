import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbComplianceFindingsForOrg } from "../data/ucb-overview.server"
import { buildUcbComplianceListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"

export async function UcbComplianceSection({
  organizationId,
  orgSlug,
}: {
  organizationId: string
  orgSlug: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbComplianceFindingsForOrg(organizationId)

  const listConfiguration = buildUcbComplianceListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("complianceEmpty"),
      colCode: t("colCode"),
      colSeverity: t("colSeverity"),
      colEmployee: t("colEmployee"),
      colMessage: t("colMessage"),
    }
  )

  return (
    <Card
      size="sm"
      id="ucb-compliance-section"
      data-testid="ucb-compliance-section"
    >
      <CardHeader>
        <CardTitle>{t("complianceTitle")}</CardTitle>
        <CardDescription>{t("complianceDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.compliance}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.compliance}`}
        />
      </CardContent>
    </Card>
  )
}
