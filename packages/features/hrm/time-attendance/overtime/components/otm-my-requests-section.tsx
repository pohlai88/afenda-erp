import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { OtmMyRequestTrailingCell } from "./otm-my-request-trailing-cell.client"

import { buildOtmEmbeddedListSurfaceErrorConfiguration } from "../data/otm-embedded-list-surface-error.server"
import { buildOtmMyRequestsListSurfaceConfiguration } from "../data/otm-surface-builders.server"
import { getOtmDayCategoryLabelMap } from "../data/otm-section-labels.server"
import { listOtmRequestsForOrg } from "../data/otm.queries.server"
import { OTM_LIST_SURFACE_IDS } from "../data/otm-surface-metadata.shared"

export async function OtmMyRequestsSection({
  organizationId,
  employeeId,
}: {
  organizationId: string
  employeeId: string
}) {
  const [t, format, dayCategoryLabels] = await Promise.all([
    getTranslations("Erp.Hrm.overtime"),
    getFormatter(),
    getOtmDayCategoryLabelMap(),
  ])

  let rows: Awaited<ReturnType<typeof listOtmRequestsForOrg>>
  try {
    rows = await listOtmRequestsForOrg(organizationId, {
      employeeId,
      limit: 30,
    })
  } catch (err) {
    logUnexpectedServerError("otm-my-requests: query failed", err, {
      organizationId,
      employeeId,
    })
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title={t("myRequestsTitle")}
        description={t("myRequestsDescription")}
        surfaceKey="hrm:overtime:my-requests:error"
        listConfiguration={buildOtmEmbeddedListSurfaceErrorConfiguration({
          columnsId: OTM_LIST_SURFACE_IDS.myRequests,
          emptyTitle: t("myRequestsEmpty"),
          firstColumn: { id: "workDate", header: t("colWorkDate") },
        })}
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: t("myRequestsLoadFailed"),
        }}
      />
    )
  }

  const listConfiguration = buildOtmMyRequestsListSurfaceConfiguration(
    rows,
    {
      columnsId: OTM_LIST_SURFACE_IDS.myRequests,
      empty: t("myRequestsEmpty"),
      colEmployee: t("colEmployee"),
      colWorkDate: t("colWorkDate"),
      colTimeRange: t("colTimeRange"),
      colDuration: t("colDuration"),
      colDayCategory: t("colDayCategory"),
      colState: t("colState"),
      colRequested: t("colRequested"),
      dayCategoryLabels,
      formatRequestedAt: (date) =>
        format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
      stateLabelFor: (state) =>
        t(`stateLabels.${state}` as "stateLabels.submitted"),
    },
    { actionLabel: t("myRequestAction") }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title={t("myRequestsTitle")}
      description={t("myRequestsDescription")}
      surfaceKey={OTM_LIST_SURFACE_IDS.myRequests}
      listConfiguration={listConfiguration}
      invalid={{
        variant: "error",
        title: t("myRequestsLoadFailed"),
      }}
      trailingColumn={{
        header: t("colActions"),
        Cell: OtmMyRequestTrailingCell,
        context: {
          requests: rows.map((row) => ({
            id: row.id,
            state: row.state,
            timeRange: `${row.workDate} · ${row.startTime}–${row.endTime}`,
          })),
        },
      }}
    />
  )
}
