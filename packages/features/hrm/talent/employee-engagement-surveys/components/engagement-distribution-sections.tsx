import { getTranslations } from "next-intl/server"

import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { toEngagementListLoadError } from "../data/engagement-load-error.shared"
import type { EngagementLoadError } from "../data/engagement-load-error.shared"
import { buildEngagementCompletionTrackingListSurfaceConfiguration } from "../data/engagement-surface-builders.server"
import type { EngagementSurveyConfigurationDetail } from "../schemas/engagement-config.shared"
import type {
  EngagementCompletionTrackingRow,
  EngagementDistributionSummary,
} from "../schemas/engagement-query.shared"
import {
  CloseEngagementSurveyForm,
  PublishEngagementSurveyForm,
} from "./engagement-distribution-forms.client"
import { EngagementCompletionTrailingCell } from "./engagement-list-trailing-cells.client"

type SectionBaseProps = {
  parentAccessAllowed: boolean
  loadError?: EngagementLoadError
  canManage: boolean
}

export async function EngagementDistributionActionsSection({
  survey,
  canManage,
}: {
  survey: EngagementSurveyConfigurationDetail
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.distribution")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("actionsTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <PublishEngagementSurveyForm
          surveyId={survey.id}
          canManage={canManage}
          surveyState={survey.state}
        />
        <CloseEngagementSurveyForm
          surveyId={survey.id}
          canManage={canManage}
          surveyState={survey.state}
        />
      </CardContent>
    </Card>
  )
}

export async function EngagementResponseRateSection({
  summary,
}: {
  summary: EngagementDistributionSummary
}) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.distribution")

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("kpiInvited")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.invitedCount}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("kpiSubmitted")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.submittedCount}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("kpiDraft")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.draftCount}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("kpiResponseRate")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.responseRatePercent}%
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export async function EngagementCompletionTrackingSection({
  survey,
  rows,
  parentAccessAllowed,
  loadError,
  canManage,
}: SectionBaseProps & {
  survey: EngagementSurveyConfigurationDetail
  rows: readonly EngagementCompletionTrackingRow[]
}) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.distribution")

  const invitationStateLabels = {
    pending: t("invitationStateLabels.pending"),
    submitted: t("invitationStateLabels.submitted"),
    expired: t("invitationStateLabels.expired"),
  } as const

  const responseStateLabels = {
    draft: t("responseStateLabels.draft"),
    submitted: t("responseStateLabels.submitted"),
  } as const

  const listConfiguration =
    buildEngagementCompletionTrackingListSurfaceConfiguration(
      rows,
      {
        empty: t("completionEmpty"),
        colParticipant: t("colParticipant"),
        colInvitation: t("colInvitation"),
        colResponse: t("colResponse"),
        colSubmitted: t("colSubmitted"),
        resendLabel: t("resendInvitation"),
        resendDisabledReason: t("resendDisabledReason"),
        formatInvitationState: (state) => invitationStateLabels[state],
        formatResponseState: (state) =>
          state ? responseStateLabels[state] : t("responseNone"),
      },
      {
        canManage,
        surveyPublished: survey.state === "published",
      }
    )

  return (
    <GovernedPatternCListSection
      title={t("completionTitle")}
      description={t("completionDescription")}
      surfaceKey="hrm:employee-engagement:completion-tracking"
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
        Cell: EngagementCompletionTrailingCell,
        context: {
          invitations: rows.map((row) => ({
            invitationId: row.invitationId,
          })),
        },
      }}
    />
  )
}
