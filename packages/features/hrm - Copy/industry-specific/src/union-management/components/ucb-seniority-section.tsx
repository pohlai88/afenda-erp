import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbSeniorityProfilesForOrg } from "../data/ucb-seniority.server"
import { buildUcbSeniorityListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"

export async function UcbSenioritySection({
  organizationId,
  orgSlug,
}: {
  organizationId: string
  orgSlug: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbSeniorityProfilesForOrg(organizationId)

  const listConfiguration = buildUcbSeniorityListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("seniorityEmpty"),
      colEmployee: t("colEmployee"),
      colDate: t("colSeniorityDate"),
      colRank: t("colRank"),
    }
  )

  return (
    <Card size="sm" id="ucb-seniority-section" data-testid="ucb-seniority-section">
      <CardHeader>
        <CardTitle>{t("seniorityTitle")}</CardTitle>
        <CardDescription>{t("seniorityDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.seniority}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.seniority}`}
        />
      </CardContent>
    </Card>
  )
}
