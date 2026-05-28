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

import { countActiveCareerPathFrameworksForOrg } from "../data/career-path-framework.queries.server"
import { buildCareerPathingEmbeddedListSurfaceErrorConfiguration } from "../data/career-pathing-embedded-list-surface-error.server"
import { buildOverviewKpiSurfaceConfiguration } from "../data/career-pathing-list-surface.server"
import {
  countActivePlansForOrg,
  countOverdueMilestonesForOrg,
  listLatestReadinessForOrg,
} from "../data/career-pathing.queries.server"
import { CAREER_PATHING_LIST_SURFACE_IDS } from "../data/career-pathing-surface-metadata.shared"

export async function CareerPathingOverviewSection({
  organizationId,
}: {
  organizationId: string
}) {
  const t = await getTranslations("Erp.Hrm.careerPathing")

  let activeFrameworks: number
  let activePlans: number
  let overdueMilestones: number
  let readiness: Awaited<ReturnType<typeof listLatestReadinessForOrg>>

  try {
    ;[activeFrameworks, activePlans, overdueMilestones, readiness] =
      await Promise.all([
        countActiveCareerPathFrameworksForOrg(organizationId),
        countActivePlansForOrg(organizationId),
        countOverdueMilestonesForOrg(organizationId),
        listLatestReadinessForOrg(organizationId),
      ])
  } catch (err) {
    logUnexpectedServerError("career-pathing-overview: query failed", err, {
      organizationId,
    })
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("overviewTitle")}</CardTitle>
          <CardDescription>{t("overviewDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={buildCareerPathingEmbeddedListSurfaceErrorConfiguration(
              {
                columnsId: CAREER_PATHING_LIST_SURFACE_IDS.overviewKpi,
                emptyTitle: t("overviewTitle"),
                firstColumn: { id: "label", header: "" },
              }
            )}
            surfaceKey="hrm:career-pathing:overview-kpi:error"
            resolveConfiguredPermission={false}
            loadError={{
              variant: "error",
              title: t("overviewLoadFailed"),
            }}
          />
        </CardContent>
      </Card>
    )
  }

  const nearReadyCount = readiness.filter(
    (row) =>
      row.readinessLevel === "near_ready" || row.readinessLevel === "ready"
  ).length

  const listConfiguration = buildOverviewKpiSurfaceConfiguration({
    activeFrameworks,
    activePlans,
    overdueMilestones,
    nearReadyCount,
    labels: {
      frameworks: t("kpiFrameworks"),
      plans: t("kpiPlans"),
      overdue: t("kpiOverdue"),
      nearReady: t("kpiNearReady"),
    },
  })

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("overviewTitle")}</CardTitle>
        <CardDescription>{t("overviewDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          title={t("overviewTitle")}
          description={t("overviewDescription")}
          listConfiguration={listConfiguration}
          surfaceKey="hrm:career-pathing:overview-kpi"
          layout="embedded"
          resolveConfiguredPermission={false}
        />
      </CardContent>
    </Card>
  )
}
