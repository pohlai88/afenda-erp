import { getTranslations } from "next-intl/server"

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { toEngagementListLoadError } from "../data/engagement-load-error.shared"
import type { EngagementLoadError } from "../data/engagement-load-error.shared"
import { buildEngagementImprovementActionsListSurfaceConfiguration } from "../data/engagement-surface-builders.server"
import type { EngagementSurveyConfigurationDetail } from "../schemas/engagement-config.shared"
import type {
  EngagementImprovementActionListRow,
  EngagementImprovementOwnerOption,
} from "../schemas/engagement-query.shared"

import { CreateEngagementImprovementActionForm } from "./engagement-improvement-forms.client"
import { EngagementImprovementTrailingCell } from "./engagement-list-trailing-cells.client"

type EngagementImprovementSectionProps = {
  survey: EngagementSurveyConfigurationDetail
  rows: readonly EngagementImprovementActionListRow[]
  ownerOptions: readonly EngagementImprovementOwnerOption[]
  overdueCount: number
  parentAccessAllowed: boolean
  loadError?: EngagementLoadError
  canManage: boolean
}

export async function EngagementImprovementActionsSection({
  survey,
  rows,
  ownerOptions,
  overdueCount,
  parentAccessAllowed,
  loadError,
  canManage,
}: EngagementImprovementSectionProps) {
  const t = await getTranslations(
    "Erp.Hrm.employeeEngagement.distribution.improvement"
  )

  const statusLabels = {
    open: t("statusLabels.open"),
    in_progress: t("statusLabels.in_progress"),
    completed: t("statusLabels.completed"),
    cancelled: t("statusLabels.cancelled"),
  } as const

  const priorityLabels = {
    low: t("priorityLabels.low"),
    medium: t("priorityLabels.medium"),
    high: t("priorityLabels.high"),
  } as const

  const listConfiguration =
    buildEngagementImprovementActionsListSurfaceConfiguration(
      rows,
      {
        empty: t("listEmpty"),
        colTitle: t("colTitle"),
        colOwner: t("colOwner"),
        colDue: t("colDue"),
        colPriority: t("colPriority"),
        colStatus: t("colStatus"),
        colCategory: t("colCategory"),
        colUpdated: t("colUpdated"),
        startLabel: t("startProgress"),
        completeLabel: t("completeAction"),
        readOnlyReason: t("readOnlyReason"),
        formatStatus: (status) => statusLabels[status],
        formatPriority: (priority) =>
          priority && priority in priorityLabels
            ? priorityLabels[priority as keyof typeof priorityLabels]
            : "—",
        formatDue: (dueDate, isOverdue) =>
          dueDate
            ? isOverdue
              ? t("dueOverdue", { date: dueDate })
              : dueDate
            : "—",
      },
      { canManage }
    )

  return (
    <div className="flex flex-col gap-4">
      {overdueCount > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>{t("overdueBannerTitle")}</AlertTitle>
          <AlertDescription>
            {t("overdueBannerDescription", { count: overdueCount })}
          </AlertDescription>
        </Alert>
      ) : null}

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("createTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateEngagementImprovementActionForm
              surveyId={survey.id}
              canManage={canManage}
              ownerOptions={ownerOptions}
            />
          </CardContent>
        </Card>
      ) : null}

      <GovernedPatternCListSection
        title={t("listTitle")}
        description={t("listDescription")}
        surfaceKey="hrm:employee-engagement:improvement-actions"
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
        resolveConfiguredPermission
        loadError={toEngagementListLoadError(loadError)}
        forbidden={{
          variant: "forbidden",
          title: t("forbiddenTitle"),
          description: t("forbiddenDescription"),
        }}
        invalid={{
          variant: "error",
          title: t("invalidConfigTitle"),
          description: t("invalidConfigDescription"),
        }}
        trailingColumn={{
          header: t("colActions"),
          Cell: EngagementImprovementTrailingCell,
          context: { surveyId: survey.id, rows },
        }}
      />
    </div>
  )
}
