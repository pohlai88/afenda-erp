import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbMembershipsForOrg } from "../data/ucb-membership.server"
import { buildUcbMembershipsListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"

export async function UcbMembershipsSection({
  organizationId,
  orgSlug,
}: {
  organizationId: string
  orgSlug: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbMembershipsForOrg(organizationId)

  const listConfiguration = buildUcbMembershipsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("membershipsEmpty"),
      colEmployee: t("colEmployee"),
      colUnion: t("colUnion"),
      colUnit: t("colUnit"),
      colStatus: t("colStatus"),
      colDates: t("colDates"),
    }
  )

  return (
    <Card
      size="sm"
      id="ucb-memberships-section"
      data-testid="ucb-memberships-section"
    >
      <CardHeader>
        <CardTitle>{t("membershipsTitle")}</CardTitle>
        <CardDescription>{t("membershipsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.memberships}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.memberships}`}
        />
      </CardContent>
    </Card>
  )
}
