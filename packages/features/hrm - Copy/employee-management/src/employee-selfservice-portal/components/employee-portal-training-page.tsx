import { getFormatter, getTranslations } from "next-intl/server"

import { Badge } from "@afenda/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import {
  listTrainingAssignmentsForOrg,
  listTrainingRecordsForOrg,
} from "@afenda/feature-hrm-talent-management/server"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { requireEmployeePortalContext } from "../data/employee-portal-access.server"
import {
  buildEmployeePortalTrainingDueListSurfaceConfiguration,
  buildEmployeePortalTrainingHistoryListSurfaceConfiguration,
} from "../data/employee-portal-list-surface.server"
import { getEmployeePortalSectionNavLabels } from "../data/employee-portal-nav-labels.server"

import {
  EmployeePortalTrainingDueTrailingCell,
  EmployeePortalTrainingHistoryTrailingCell,
} from "./employee-portal-list-trailing-cells.client"
import { EmployeePortalSectionNav } from "./employee-portal-section-nav"

type EmployeePortalTrainingPageProps = {
  portalSlug: string
}

export async function EmployeePortalTrainingPage({
  portalSlug,
}: EmployeePortalTrainingPageProps) {
  const context = await requireEmployeePortalContext(portalSlug)
  const organizationId = context.portal.organizationId
  const employeeId = context.employee.id

  const [t, navLabels, format, assignments, records] = await Promise.all([
    getTranslations("Erp.Hrm.training"),
    getEmployeePortalSectionNavLabels(),
    getFormatter(),
    listTrainingAssignmentsForOrg(organizationId, {
      employeeId,
      states: ["assigned", "overdue"],
    }),
    listTrainingRecordsForOrg(organizationId, { employeeId }),
  ])

  const today = new Date().toISOString().slice(0, 10)

  const trailingContext = { showRowActions: true } as const

  const dueConfiguration =
    buildEmployeePortalTrainingDueListSurfaceConfiguration(
      assignments,
      {
        empty: t("portalDueEmpty"),
        colCourse: t("colCourse"),
        colDue: t("colDue"),
        colState: t("colState"),
        formatDue: (value) =>
          value ? format.dateTime(value, { dateStyle: "medium" }) : "—",
      },
      trailingContext
    )

  const historyConfiguration =
    buildEmployeePortalTrainingHistoryListSurfaceConfiguration(
      records,
      {
        empty: t("portalHistoryEmpty"),
        colCourse: t("colCourse"),
        colCompleted: t("colCompleted"),
        colVerification: t("colState"),
        colFeedback: t("portalFeedbackRating"),
        formatCompleted: (value) =>
          format.dateTime(value, { dateStyle: "medium" }),
        feedbackGivenLabel: (rating) => t("portalFeedbackGiven", { rating }),
      },
      trailingContext
    )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("portalEyebrow", {
            employeeNumber: context.employee.employeeNumber,
          })}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-normal">
            {t("portalPageTitle")}
          </h1>
          <Badge variant="outline">{context.employee.legalName}</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("portalPageDescription")}
        </p>
      </header>

      <EmployeePortalSectionNav
        portalSlug={context.portal.portalSlug}
        current="training"
        labels={navLabels}
      />

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">{t("portalDueTitle")}</CardTitle>
          <CardDescription>{t("portalDueDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={dueConfiguration}
            surfaceKey="hrm:portal:training-due"
            resolveConfiguredPermission={false}
            trailingColumn={{
              header: " ",
              Cell: EmployeePortalTrainingDueTrailingCell,
              context: {
                portalSlug,
                attestLabel: t("portalAttest"),
                completedAt: today,
                assignments: assignments.map((row) => ({
                  id: row.id,
                  courseId: row.courseId,
                  sessionId: row.sessionId,
                })),
              },
            }}
          />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">{t("portalHistoryTitle")}</CardTitle>
          <CardDescription>{t("portalHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={historyConfiguration}
            surfaceKey="hrm:portal:training-history"
            resolveConfiguredPermission={false}
            trailingColumn={{
              header: " ",
              Cell: EmployeePortalTrainingHistoryTrailingCell,
              context: {
                portalSlug,
                organizationId,
                records: records.map((row) => ({
                  id: row.id,
                  courseName: row.courseName,
                  feedbackRating: row.feedbackRating,
                })),
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
