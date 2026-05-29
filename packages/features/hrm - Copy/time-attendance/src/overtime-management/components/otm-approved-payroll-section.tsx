import { getFormatter, getTranslations } from "next-intl/server"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { buildOtmEmbeddedListSurfaceErrorConfiguration } from "../data/otm-embedded-list-surface-error.server"
import { buildOtmApprovedPayrollMarkListSurfaceConfiguration } from "../data/otm-surface-builders.server"
import { getOtmDayCategoryLabelMap } from "../data/otm-section-labels.server"
import { listOtmApprovedForPayrollMarking } from "../data/otm.queries.server"
import { OTM_LIST_SURFACE_IDS } from "../data/otm-surface-metadata.shared"
import { OtmMarkPayrollTrailingCell } from "./otm-mark-payroll-trailing-cell.client"

export async function OtmApprovedPayrollSection({
  organizationId,
  orgSlug,
}: {
  organizationId: string
  orgSlug: string
}) {
  const [t, format, dayCategoryLabels] = await Promise.all([
    getTranslations("Erp.Hrm.overtime"),
    getFormatter(),
    getOtmDayCategoryLabelMap(),
  ])

  let rows: Awaited<ReturnType<typeof listOtmApprovedForPayrollMarking>>
  try {
    rows = await listOtmApprovedForPayrollMarking(organizationId)
  } catch (err) {
    logUnexpectedServerError("otm-approved-payroll: query failed", err, {
      organizationId,
    })
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("approvedPayrollTitle")}</CardTitle>
          <CardDescription>{t("approvedPayrollDescription")}</CardDescription>
        </CardHeader>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          description=""
          surfaceKey="hrm:overtime:approved-payroll:error"
          listConfiguration={buildOtmEmbeddedListSurfaceErrorConfiguration({
            columnsId: OTM_LIST_SURFACE_IDS.approvedPayroll,
            emptyTitle: t("approvedPayrollEmpty"),
            firstColumn: { id: "employee", header: t("colEmployee") },
          })}
          resolveConfiguredPermission={false}
          loadError={{
            variant: "error",
            title: t("approvedPayrollLoadFailed"),
          }}
        />
      </Card>
    )
  }

  const listConfiguration = buildOtmApprovedPayrollMarkListSurfaceConfiguration(
    rows,
    {
      orgSlug,
      empty: t("approvedPayrollEmpty"),
      colEmployee: t("colEmployee"),
      colWorkDate: t("colWorkDate"),
      colTimeRange: t("colTimeRange"),
      colDuration: t("colDuration"),
      colDayCategory: t("colDayCategory"),
      colState: t("colState"),
      colRequested: t("colRequested"),
      dayCategoryLabels,
      stateLabelFor: (state) =>
        t(
          `stateLabels.${state}` as `stateLabels.${(typeof rows)[number]["state"]}`
        ),
      formatRequestedAt: (date) =>
        format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
    },
    { markPayrollLabel: t("markPayrollReady") }
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("approvedPayrollTitle")}</CardTitle>
        <CardDescription>{t("approvedPayrollDescription")}</CardDescription>
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        description=""
        surfaceKey={OTM_LIST_SURFACE_IDS.approvedPayroll}
        listConfiguration={listConfiguration}
        invalid={{
          variant: "error",
          title: t("approvedPayrollLoadFailed"),
        }}
        trailingColumn={{
          header: t("colActions"),
          Cell: OtmMarkPayrollTrailingCell,
        }}
      />
    </Card>
  )
}
