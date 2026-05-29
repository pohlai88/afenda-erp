import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { buildSftEmbeddedListSurfaceErrorConfiguration } from "@afenda/feature-hrm-time-attendance/server"

import { listRwsAttendanceReconcileRowsForOrg } from "../data/rws-integration.server"
import { buildRwsAttendanceReconcileListSurfaceConfiguration } from "../data/rws-surface-builders.server"
import { RWS_LIST_SURFACE_IDS } from "../data/rws-surface-metadata.shared"

function formatMinutes(minutes: number | null): string {
  if (minutes == null) return "—"
  return `${minutes} min`
}

export async function RwsAttendanceReconcileSection({
  organizationId,
  orgSlug,
  rangeStart,
  rangeEnd,
}: {
  organizationId: string
  orgSlug: string
  rangeStart: string
  rangeEnd: string
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")

  let rows: Awaited<ReturnType<typeof listRwsAttendanceReconcileRowsForOrg>>
  try {
    rows = await listRwsAttendanceReconcileRowsForOrg({
      organizationId,
      rangeStart,
      rangeEnd,
    })
  } catch (err) {
    logUnexpectedServerError("rws-attendance-reconcile: query failed", err, {
      organizationId,
    })
    return (
      <Card size="sm" data-testid="rws-attendance-reconcile-section">
        <CardHeader>
          <CardTitle>{t("attendanceReconcileTitle")}</CardTitle>
          <CardDescription>
            {t("attendanceReconcileDescription", { rangeStart, rangeEnd })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={buildSftEmbeddedListSurfaceErrorConfiguration({
              columnsId: RWS_LIST_SURFACE_IDS.attendanceCompare,
              emptyTitle: t("attendanceReconcileEmpty"),
              firstColumn: { id: "employee", header: t("colEmployee") },
            })}
            surfaceKey="hrm:rws:attendance-reconcile:error"
            resolveConfiguredPermission={false}
            loadError={{
              variant: "error",
              title: t("attendanceReconcileLoadFailed"),
            }}
          />
        </CardContent>
      </Card>
    )
  }

  const listConfiguration = buildRwsAttendanceReconcileListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("attendanceReconcileEmpty"),
      colEmployee: t("colEmployee"),
      colDate: t("colDate"),
      colScheduled: t("colScheduledMinutes"),
      colActual: t("colActualMinutes"),
      colVariance: t("colVarianceMinutes"),
      formatMinutes,
    }
  )

  return (
    <Card size="sm" data-testid="rws-attendance-reconcile-section">
      <CardHeader>
        <CardTitle>{t("attendanceReconcileTitle")}</CardTitle>
        <CardDescription>
          {t("attendanceReconcileDescription", { rangeStart, rangeEnd })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={RWS_LIST_SURFACE_IDS.attendanceCompare}
          invalid={{
            variant: "error",
            title: t("attendanceReconcileLoadFailed"),
          }}
          data-testid={`governed-list-section:${RWS_LIST_SURFACE_IDS.attendanceCompare}`}
        />
      </CardContent>
    </Card>
  )
}
