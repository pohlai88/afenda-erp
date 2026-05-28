import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbDuesReferencesForOrg } from "../data/ucb-dues.server"
import { buildUcbDuesListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"

export async function UcbDuesSection({
  organizationId,
  orgSlug,
}: {
  organizationId: string
  orgSlug: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbDuesReferencesForOrg(organizationId)

  const listConfiguration = buildUcbDuesListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("duesEmpty"),
      colEmployee: t("colEmployee"),
      colAmount: t("colAmount"),
      colState: t("colStatus"),
      colEffective: t("colEffective"),
    }
  )

  return (
    <Card size="sm" id="ucb-dues-section" data-testid="ucb-dues-section">
      <CardHeader>
        <CardTitle>{t("duesTitle")}</CardTitle>
        <CardDescription>{t("duesDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.dues}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.dues}`}
        />
      </CardContent>
    </Card>
  )
}
