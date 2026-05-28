import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbRepresentativesForOrg } from "../data/ucb-representatives.server"
import { buildUcbRepresentativesListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"

export async function UcbRepresentativesSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbRepresentativesForOrg(organizationId)

  const listConfiguration = buildUcbRepresentativesListSurfaceConfiguration(
    rows,
    {
      empty: t("representativesEmpty"),
      colUnion: t("colUnion"),
      colRole: t("colRole"),
      colEmployee: t("colEmployee"),
      colSite: t("colSite"),
    }
  )

  return (
    <Card
      size="sm"
      id="ucb-representatives-section"
      data-testid="ucb-representatives-section"
    >
      <CardHeader>
        <CardTitle>{t("representativesTitle")}</CardTitle>
        <CardDescription>{t("representativesDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.representatives}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.representatives}`}
        />
      </CardContent>
    </Card>
  )
}
