import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listRwsCoverageGapsForPeriod } from "../data/rws-coverage.server"
import { listRwsSchedulePeriodsForOrg } from "../data/rws-periods.server"
import { listRwsStoreChoicesForOrg } from "../data/rws-stores.server"
import { buildRwsCoverageGapsListSurfaceConfiguration } from "../data/rws-surface-builders.server"
import { RWS_LIST_SURFACE_IDS } from "../data/rws-surface-metadata.shared"
import { RwsCoverageSlotCreateDialog } from "./rws-coverage-slot-create-dialog.client"

export async function RwsCoverageGapsSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")
  const [periods, storeChoices] = await Promise.all([
    listRwsSchedulePeriodsForOrg(organizationId),
    listRwsStoreChoicesForOrg(organizationId),
  ])
  const draftPeriods = periods.filter((p) => p.state === "draft")
  const draft = draftPeriods[0] ?? periods[0]

  const gaps = draft
    ? await listRwsCoverageGapsForPeriod({
        organizationId,
        schedulePeriodId: draft.id,
        periodStartDate: draft.periodStartDate,
        periodEndDate: draft.periodEndDate,
      })
    : []

  const listConfiguration = buildRwsCoverageGapsListSurfaceConfiguration(gaps, {
    empty: t("coverageGapsEmpty"),
    colDate: t("colDate"),
    colHour: t("colHour"),
    colRole: t("colRole"),
    colRequired: t("colRequired"),
    colScheduled: t("colScheduled"),
    colStatus: t("colStatus"),
    statusLabel: (status) => t(`coverageStatusLabels.${status}`),
  })

  return (
    <Card
      size="sm"
      id="rws-coverage-gaps-section"
      data-testid="rws-coverage-gaps-section"
    >
      <CardHeader>
        <CardTitle>{t("coverageGapsTitle")}</CardTitle>
        <CardDescription>
          {draft
            ? t("coverageGapsDescription", { period: draft.code })
            : t("coverageGapsNoPeriod")}
        </CardDescription>
        {canManage ? (
          <CardAction>
            <RwsCoverageSlotCreateDialog
              draftPeriods={draftPeriods}
              storeChoices={storeChoices}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={RWS_LIST_SURFACE_IDS.coverageGaps}
        />
      </CardContent>
    </Card>
  )
}
