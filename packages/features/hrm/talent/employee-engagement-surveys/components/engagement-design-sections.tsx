import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"

import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui/card"
import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { toEngagementListLoadError } from "../data/engagement-load-error.shared"
import type { EngagementLoadError } from "../data/engagement-load-error.shared"
import {
  buildEngagementConfigurableSurveysListSurfaceConfiguration,
  buildEngagementDraftSurveysListSurfaceConfiguration,
  buildEngagementTemplateQuestionsListSurfaceConfiguration,
  buildEngagementTemplatesListSurfaceConfiguration,
} from "../data/engagement-surface-builders.server"
import type {
  EngagementConfigurableSurveyListRow,
  EngagementDraftSurveyListRow,
  EngagementTemplateListRow,
  EngagementTemplateOption,
  EngagementTemplateQuestionListRow,
} from "../schemas/engagement-query.shared"

import {
  AddEngagementTemplateQuestionForm,
  ArchiveEngagementTemplateForm,
  CloneEngagementTemplateForm,
  CreateEngagementSurveyDraftForm,
  CreateEngagementTemplateForm,
  DeleteEngagementSurveyDraftForm,
  UpdateEngagementSurveyDraftForm,
  UpdateEngagementTemplateForm,
} from "./engagement-design-forms.client"
import { EngagementSurveyConfigureLinks } from "./engagement-config-forms.client"

type SectionBaseProps = {
  parentAccessAllowed: boolean
  loadError?: EngagementLoadError
}

function EngagementDesignPanel({
  canManage,
  canCreate = false,
  children,
}: {
  canManage: boolean
  canCreate?: boolean
  children: ReactNode
}) {
  if (!canManage && !canCreate) return null
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>
}

export async function EngagementTemplatesSection({
  rows,
  templateOptions,
  canManage,
  canCreate,
  parentAccessAllowed,
  loadError,
}: SectionBaseProps & {
  rows: readonly EngagementTemplateListRow[]
  templateOptions: readonly EngagementTemplateOption[]
  canManage: boolean
  canCreate: boolean
}) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.tables")

  const listConfiguration = buildEngagementTemplatesListSurfaceConfiguration(
    rows,
    {
      empty: t("templatesEmpty"),
      colCode: t("colCode"),
      colName: t("colName"),
      colState: t("colState"),
      colQuestions: t("colQuestions"),
      colUpdated: t("colUpdated"),
      formatState: (state) => t(`templateStateLabels.${state}`),
    }
  )

  const designPanel = (
    <EngagementDesignPanel canManage={canManage} canCreate={canCreate}>
      {canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("createTemplateTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateEngagementTemplateForm />
          </CardContent>
        </Card>
      ) : null}
      {canManage ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("updateTemplateTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateEngagementTemplateForm templates={rows} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("cloneTemplateTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CloneEngagementTemplateForm templates={templateOptions} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("archiveTemplateTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ArchiveEngagementTemplateForm templates={rows} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </EngagementDesignPanel>
  )

  return (
    <GovernedPatternBListSection
      title={t("templatesTitle")}
      description={t("templatesDescription")}
      surfaceKey="hrm:employee-engagement:templates"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission
      loadError={toEngagementListLoadError(loadError)}
      contentAfterList={designPanel}
    />
  )
}

export async function EngagementTemplateQuestionsSection({
  rows,
  templateOptions,
  parentAccessAllowed,
  loadError,
  canManage,
}: SectionBaseProps & {
  rows: readonly EngagementTemplateQuestionListRow[]
  templateOptions: readonly EngagementTemplateOption[]
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.tables")

  const listConfiguration =
    buildEngagementTemplateQuestionsListSurfaceConfiguration(rows, {
      empty: t("questionBankEmpty"),
      colTemplate: t("colTemplate"),
      colOrder: t("colOrder"),
      colType: t("colType"),
      colCategory: t("colCategory"),
      colPrompt: t("colPrompt"),
      formatQuestionType: (type) => t(`questionTypeLabels.${type}`),
      formatCategory: (category) => t(`categoryLabels.${category}`),
    })

  const addQuestionPanel = canManage ? (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("addQuestionTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <AddEngagementTemplateQuestionForm templates={templateOptions} />
      </CardContent>
    </Card>
  ) : null

  return (
    <GovernedPatternBListSection
      title={t("questionBankTitle")}
      description={t("questionBankDescription")}
      surfaceKey="hrm:employee-engagement:template-questions"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission
      loadError={toEngagementListLoadError(loadError)}
      contentAfterList={addQuestionPanel}
    />
  )
}

export async function EngagementDraftSurveysSection({
  rows,
  templateOptions,
  canManage,
  canCreate,
  parentAccessAllowed,
  loadError,
}: SectionBaseProps & {
  rows: readonly EngagementDraftSurveyListRow[]
  templateOptions: readonly EngagementTemplateOption[]
  canManage: boolean
  canCreate: boolean
}) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement.tables")

  const listConfiguration = buildEngagementDraftSurveysListSurfaceConfiguration(
    rows,
    {
      empty: t("draftSurveysEmpty"),
      colTitle: t("colTitle"),
      colType: t("colType"),
      colTemplate: t("colTemplate"),
      colQuestions: t("colQuestions"),
      colUpdated: t("colUpdated"),
      formatSurveyType: (type) => t(`surveyTypeLabels.${type}`),
      formatState: () => t("surveyStateLabels.draft"),
    }
  )

  const designPanel = (
    <EngagementDesignPanel canManage={canManage} canCreate={canCreate}>
      {canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("createSurveyTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateEngagementSurveyDraftForm
              templateOptions={templateOptions}
            />
          </CardContent>
        </Card>
      ) : null}
      {canManage ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("updateSurveyTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateEngagementSurveyDraftForm draftSurveys={rows} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("deleteSurveyTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeleteEngagementSurveyDraftForm draftSurveys={rows} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </EngagementDesignPanel>
  )

  return (
    <GovernedPatternBListSection
      title={t("draftSurveysTitle")}
      description={t("draftSurveysDescription")}
      surfaceKey="hrm:employee-engagement:surveys-draft"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission
      loadError={toEngagementListLoadError(loadError)}
      contentAfterList={designPanel}
    />
  )
}

export async function EngagementConfigurableSurveysSection({
  orgSlug,
  rows,
  parentAccessAllowed,
  loadError,
}: SectionBaseProps & {
  orgSlug: string
  rows: readonly EngagementConfigurableSurveyListRow[]
}) {
  const tConfig = await getTranslations("Erp.Hrm.employeeEngagement.config")
  const tTables = await getTranslations("Erp.Hrm.employeeEngagement.tables")

  const listConfiguration =
    buildEngagementConfigurableSurveysListSurfaceConfiguration(rows, {
      empty: tConfig("configurableSurveysEmpty"),
      colTitle: tConfig("colTitle"),
      colType: tConfig("colType"),
      colState: tConfig("colState"),
      colAudience: tConfig("colAudience"),
      colWindow: tConfig("colWindow"),
      colQuestions: tConfig("colQuestions"),
      formatSurveyType: (type) => tTables(`surveyTypeLabels.${type}`),
      formatState: (state) => tConfig(`surveyStateLabels.${state}`),
    })

  return (
    <GovernedPatternBListSection
      title={tConfig("configurableSurveysTitle")}
      description={tConfig("configurableSurveysDescription")}
      surfaceKey="hrm:employee-engagement:surveys-configurable"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission
      loadError={toEngagementListLoadError(loadError)}
      contentAfterList={
        <EngagementSurveyConfigureLinks
          orgSlug={orgSlug}
          surveys={rows.map((row) => ({
            id: row.id,
            title: row.title,
            state: row.state,
          }))}
        />
      }
    />
  )
}
