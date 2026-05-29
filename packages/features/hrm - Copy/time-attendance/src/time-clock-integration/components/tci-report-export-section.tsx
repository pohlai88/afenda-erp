import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { getTranslations } from "next-intl/server"

import { listTimeClockReportFilterOptions } from "../data/tci-report-options.server"

import { TimeClockReportExportForm } from "./tci-report-export.client"

export async function TimeClockReportExportSection({
  orgSlug,
  organizationId,
}: {
  orgSlug: string
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.report")
  const filterOptions = await listTimeClockReportFilterOptions(organizationId)

  return (
    <Card size="sm" data-testid="hrm:time-clock:report-export">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <TimeClockReportExportForm
          orgSlug={orgSlug}
          filterOptions={filterOptions}
        />
      </CardContent>
    </Card>
  )
}
