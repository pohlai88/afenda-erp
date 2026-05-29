import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listUcbLrMeetingsForOrg } from "../data/ucb-meetings.server"
import { buildUcbMeetingsListSurfaceConfiguration } from "../data/ucb-surface-builders.server"
import { UCB_LIST_SURFACE_IDS } from "../data/ucb-surface-metadata.shared"

export async function UcbMeetingsSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")
  const rows = await listUcbLrMeetingsForOrg(organizationId)

  const listConfiguration = buildUcbMeetingsListSurfaceConfiguration(rows, {
    empty: t("meetingsEmpty"),
    colTitle: t("colTitle"),
    colScheduled: t("colScheduled"),
    colStatus: t("colStatus"),
    colParticipants: t("colParticipants"),
  })

  return (
    <Card size="sm" id="ucb-meetings-section" data-testid="ucb-meetings-section">
      <CardHeader>
        <CardTitle>{t("meetingsTitle")}</CardTitle>
        <CardDescription>{t("meetingsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={UCB_LIST_SURFACE_IDS.meetings}
          data-testid={`governed-list-section:${UCB_LIST_SURFACE_IDS.meetings}`}
        />
      </CardContent>
    </Card>
  )
}
