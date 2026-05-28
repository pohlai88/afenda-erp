import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbCbaRulesForOrg } from "../data/ucb-rules.server"
import { buildUcbCbaRulesListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"

export async function UcbCbaRulesSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbCbaRulesForOrg(organizationId)

  const listConfiguration = buildUcbCbaRulesListSurfaceConfiguration(rows, {
    empty: t("cbaRulesEmpty"),
    colAgreement: t("colAgreement"),
    colDomain: t("colDomain"),
    colCode: t("colCode"),
    colSummary: t("colSummary"),
    colActive: t("colActive"),
  })

  return (
    <Card size="sm" id="ucb-cba-rules-section" data-testid="ucb-cba-rules-section">
      <CardHeader>
        <CardTitle>{t("cbaRulesTitle")}</CardTitle>
        <CardDescription>{t("cbaRulesDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.cbaRules}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.cbaRules}`}
        />
      </CardContent>
    </Card>
  )
}
