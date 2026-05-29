import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildTrainingPrerequisitesListSurfaceConfiguration } from "../data/training-prerequisites-list-surface.server"
import type { TrainingPrerequisiteRow } from "../data/training-prerequisite.server"

import { TrainingPrerequisiteTrailingCell } from "./training-list-trailing-cells.client"

type TrainingPrerequisitesListSectionProps = {
  prerequisites: readonly TrainingPrerequisiteRow[]
  courseNameById: Readonly<Record<string, string>>
  organizationId: string
  orgSlug: string
  isHrmAdmin: boolean
  removeAction: (formData: FormData) => void | Promise<void>
}

export async function TrainingPrerequisitesListSection({
  prerequisites,
  courseNameById,
  organizationId,
  orgSlug,
  isHrmAdmin,
  removeAction,
}: TrainingPrerequisitesListSectionProps) {
  const t = await getTranslations("Erp.Hrm.training")
  const listConfiguration = buildTrainingPrerequisitesListSurfaceConfiguration(
    prerequisites,
    {
      empty: t("prerequisiteEmpty"),
      colCourse: t("prerequisiteColCourse"),
      colRequires: t("prerequisiteColRequires"),
      colRequired: t("prerequisiteColRequired"),
      requiredLabel: t("prerequisiteRequired"),
      optionalLabel: t("prerequisiteOptional"),
      courseLabelFor: (courseId) => courseNameById[courseId] ?? courseId,
    },
    { showTrailing: isHrmAdmin }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:training:prerequisites"
      trailingColumn={
        isHrmAdmin
          ? {
              header: "",
              Cell: TrainingPrerequisiteTrailingCell,
              context: {
                organizationId,
                orgSlug,
                removeAction,
                removeLabel: t("prerequisiteRemove"),
              },
            }
          : undefined
      }
    />
  )
}
