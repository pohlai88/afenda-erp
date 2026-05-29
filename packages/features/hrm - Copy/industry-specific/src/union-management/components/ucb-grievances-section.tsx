import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbGrievancesForOrg } from "../data/ucb-grievance.server"
import { buildUcbGrievancesListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"
import { UcbGrievanceTrailingCell } from "./ucb-grievance-trailing-cell.client"

export async function UcbGrievancesSection({
  organizationId,
  orgSlug,
  canManage,
}: {
  organizationId: string
  orgSlug: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbGrievancesForOrg(organizationId)

  const listConfiguration = buildUcbGrievancesListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("grievancesEmpty"),
      colEmployee: t("colEmployee"),
      colCategory: t("colCategory"),
      colSeverity: t("colSeverity"),
      colStatus: t("colStatus"),
      colSummary: t("colSummary"),
      trailingActionLabel: t("updateGrievanceStatusAction"),
      canManage,
    }
  )

  return (
    <Card
      size="sm"
      id="ucb-grievances-section"
      data-testid="ucb-grievances-section"
    >
      <CardHeader>
        <CardTitle>{t("grievancesTitle")}</CardTitle>
        <CardDescription>{t("grievancesDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.grievances}
          trailingColumn={
            canManage
              ? {
                  header: t("colActions"),
                  Cell: UcbGrievanceTrailingCell,
                }
              : undefined
          }
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.grievances}`}
        />
      </CardContent>
    </Card>
  )
}
