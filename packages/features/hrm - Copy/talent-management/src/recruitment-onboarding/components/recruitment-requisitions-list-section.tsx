import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildRecruitmentRequisitionsListSurfaceConfiguration } from "../data/recruitment-surface-builders.server"
import type { JobRequisitionRow } from "../data/recruitment.queries.server"

type RecruitmentRequisitionsListSectionProps = {
  orgSlug: string
  rows: readonly JobRequisitionRow[]
}

export async function RecruitmentRequisitionsListSection({
  orgSlug,
  rows,
}: RecruitmentRequisitionsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.recruitment")

  const listConfiguration =
    buildRecruitmentRequisitionsListSurfaceConfiguration(rows, orgSlug, {
      empty: t("requisitionsEmpty"),
      colTitle: t("fieldTitle"),
      colDepartment: t("noDepartment"),
      colHeadcount: t("fieldHeadcount"),
      colStatus: "Status",
    })

  return (
    <GovernedPatternCListSection
      title={t("requisitionsTitle")}
      description={t("newRequisitionDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:recruitment:requisitions"
    />
  )
}
