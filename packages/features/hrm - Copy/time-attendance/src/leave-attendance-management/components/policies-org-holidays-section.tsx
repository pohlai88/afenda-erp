import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { requireOrgSession } from "@afenda/platform/auth"

import { buildOrgHolidayListSurfaceConfiguration } from "../data/org-holiday-list-surface.server"
import { listOrgHolidaysForOrganization } from "../data/org-holiday.queries.server"

import { PoliciesOrgHolidayCreateDialog } from "./policies-org-holiday-create-dialog.client"

type PoliciesOrgHolidaysSectionProps = {
  isAdmin: boolean
}

export async function PoliciesOrgHolidaysSection({
  isAdmin,
}: PoliciesOrgHolidaysSectionProps) {
  const [orgSession, t] = await Promise.all([
    requireOrgSession(),
    getTranslations("Erp.Hrm.policies"),
  ])
  const rows = await listOrgHolidaysForOrganization(orgSession.organizationId)

  const listConfiguration = buildOrgHolidayListSurfaceConfiguration(rows, {
    empty: t("holidays.empty"),
    colDate: t("holidays.colDate"),
    colName: t("holidays.colName"),
    colRegion: t("holidays.colRegion"),
  })

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("holidays.title")}</CardTitle>
        <CardDescription>{t("holidays.description")}</CardDescription>
        {isAdmin ? (
          <CardAction>
            <PoliciesOrgHolidayCreateDialog />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title={t("holidays.title")}
        description={t("holidays.description")}
        listConfiguration={listConfiguration}
        surfaceKey="hrm:org-holidays"
      />
    </Card>
  )
}
