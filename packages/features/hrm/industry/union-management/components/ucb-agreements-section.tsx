import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbCollectiveAgreementsForOrg } from "../data/ucb-cba.server"
import { buildUcbAgreementsListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"

export async function UcbAgreementsSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbCollectiveAgreementsForOrg(organizationId)

  const listConfiguration = buildUcbAgreementsListSurfaceConfiguration(rows, {
    empty: t("agreementsEmpty"),
    colTitle: t("colTitle"),
    colUnion: t("colUnion"),
    colVersion: t("colVersion"),
    colStatus: t("colStatus"),
    colEffective: t("colEffective"),
  })

  return (
    <Card size="sm" id="ucb-agreements-section" data-testid="ucb-agreements-section">
      <CardHeader>
        <CardTitle>{t("agreementsTitle")}</CardTitle>
        <CardDescription>{t("agreementsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.agreements}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.agreements}`}
        />
      </CardContent>
    </Card>
  )
}
