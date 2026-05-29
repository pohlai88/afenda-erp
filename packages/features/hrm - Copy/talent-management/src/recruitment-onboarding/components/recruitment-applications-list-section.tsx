import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildRecruitmentApplicationsListSurfaceConfiguration } from "../data/recruitment-surface-builders.server"
import type { ApplicationPipelineRow } from "../data/recruitment.queries.server"

type RecruitmentApplicationsListSectionProps = {
  orgSlug: string
  rows: readonly ApplicationPipelineRow[]
}

export async function RecruitmentApplicationsListSection({
  orgSlug,
  rows,
}: RecruitmentApplicationsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.recruitment")

  const listConfiguration =
    buildRecruitmentApplicationsListSurfaceConfiguration(rows, orgSlug, {
      empty: t("pipelineEmpty"),
      colCandidate: t("fieldCandidateName"),
      colRole: t("fieldRequisition"),
      colStage: "Stage",
    })

  return (
    <GovernedPatternCListSection
      title={t("pipelineTitle")}
      description={t("newApplicationDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:recruitment:applications"
    />
  )
}
