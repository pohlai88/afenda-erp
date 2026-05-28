import { getTranslations } from "next-intl/server"

import { ModulePageHeader } from "@afenda/governed-surface/server"

import { HrmShellAccessDeniedFromNav } from "../../../_core/registry"

import type { EmployeeEngagementSurfaceAccess } from "../data/engagement-access.server"
import {
  loadEmployeeEngagementSurveysPageData,
  type EmployeeEngagementSurveysPageData,
} from "../data/engagement-page.server"

import {
  EngagementConfigurableSurveysSection,
  EngagementDraftSurveysSection,
  EngagementTemplateQuestionsSection,
  EngagementTemplatesSection,
} from "./engagement-design-sections"

type EmployeeEngagementSurveysPageProps = {
  orgSlug: string
  access?: EmployeeEngagementSurfaceAccess
}

export async function EmployeeEngagementSurveysPage({
  orgSlug,
  access,
}: EmployeeEngagementSurveysPageProps) {
  const t = await getTranslations("Erp.Hrm.employeeEngagement")

  if (access && !access.canEnter) {
    return <HrmShellAccessDeniedFromNav navKey="employee-engagement" />
  }

  const data = await loadEmployeeEngagementSurveysPageData()
  const parentAccessAllowed = access?.canReadOrg ?? true
  const canManage = access?.canManage ?? false
  const canCreate = access?.canCreate ?? false

  return (
    <div className="flex flex-col gap-6 p-6">
      <ModulePageHeader
        eyebrow={t("eyebrow")}
        title={t("pageTitle")}
        description={t("pageDescriptionSlice2")}
      />
      <EngagementSurveysBody
        orgSlug={orgSlug}
        data={data}
        parentAccessAllowed={parentAccessAllowed}
        canManage={canManage}
        canCreate={canCreate}
      />
    </div>
  )
}

function EngagementSurveysBody({
  orgSlug,
  data,
  parentAccessAllowed,
  canManage,
  canCreate,
}: {
  orgSlug: string
  data: EmployeeEngagementSurveysPageData
  parentAccessAllowed: boolean
  canManage: boolean
  canCreate: boolean
}) {
  const sectionProps = {
    parentAccessAllowed,
    loadError: data.loadError,
    canManage,
    canCreate,
  }

  return (
    <>
      <EngagementTemplatesSection
        rows={data.templates}
        templateOptions={data.templateOptions}
        {...sectionProps}
      />
      <EngagementTemplateQuestionsSection
        rows={data.templateQuestions}
        templateOptions={data.templateOptions}
        {...sectionProps}
      />
      <EngagementDraftSurveysSection
        rows={data.draftSurveys}
        templateOptions={data.templateOptions}
        {...sectionProps}
      />
      <EngagementConfigurableSurveysSection
        orgSlug={orgSlug}
        rows={data.configurableSurveys}
        parentAccessAllowed={parentAccessAllowed}
        loadError={data.loadError}
      />
    </>
  )
}
