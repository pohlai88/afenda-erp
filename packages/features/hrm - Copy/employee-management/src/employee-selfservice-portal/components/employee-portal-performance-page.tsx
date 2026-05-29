import { getFormatter, getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { requireEmployeePortalContext } from "../data/employee-portal-access.server"
import { listKpiGoalsVisibleToEmployee } from "../data/employee-portal-kpi.queries.server"
import { buildEmployeePortalPerformanceGoalsListSurfaceConfiguration } from "../data/employee-portal-list-surface.server"
import { getEmployeePortalSectionNavLabels } from "../data/employee-portal-nav-labels.server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { EmployeePortalPerformanceTrailingCell } from "./employee-portal-list-trailing-cells.client"
import { EmployeePortalSectionNav } from "./employee-portal-section-nav"

type EmployeePortalPerformancePageProps = {
  portalSlug: string
}

export async function EmployeePortalPerformancePage({
  portalSlug,
}: EmployeePortalPerformancePageProps) {
  const context = await requireEmployeePortalContext(portalSlug)
  const [t, navLabels, format, goals] = await Promise.all([
    getTranslations("Erp.Hrm.portalPerformance"),
    getEmployeePortalSectionNavLabels(),
    getFormatter(),
    listKpiGoalsVisibleToEmployee({
      organizationId: context.portal.organizationId,
      employeeId: context.employee.id,
    }),
  ])

  const trailingContext = { showRowActions: true } as const

  const listConfiguration =
    buildEmployeePortalPerformanceGoalsListSurfaceConfiguration(
      goals,
      {
        empty: t("goalsEmpty"),
        colTitle: t("colTitle"),
        colStatus: t("colStatus"),
        colDue: t("colDue"),
        colProgress: t("colProgress"),
        formatDue: (dueDate) =>
          dueDate
            ? format.dateTime(new Date(`${dueDate}T00:00:00Z`), {
                dateStyle: "medium",
              })
            : "—",
      },
      trailingContext
    )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("pageDescription")}</p>
      </header>

      <EmployeePortalSectionNav
        portalSlug={context.portal.portalSlug}
        current="performance"
        labels={navLabels}
      />

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">{t("goalsTitle")}</CardTitle>
          <CardDescription>{t("goalsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={listConfiguration}
            surfaceKey="hrm:portal:performance-goals"
            resolveConfiguredPermission={false}
            trailingColumn={{
              header: t("colAction"),
              Cell: EmployeePortalPerformanceTrailingCell,
              context: {
                portalSlug,
                viewGoalLabel: t("viewGoal"),
                goals: goals.map((goal) => ({ id: goal.id })),
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
