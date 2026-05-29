import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildTrainingCatalogListSurfaceConfiguration } from "../data/training-list-surface.server"
import type { HrmTrainingCourseRow } from "../data/training.types.shared"

import { TrainingCatalogTrailingCell } from "./training-list-trailing-cells.client"

type TrainingCatalogSectionProps = {
  courses: readonly HrmTrainingCourseRow[]
  orgSlug: string
  organizationId: string
  isHrmAdmin: boolean
  archiveAction: (formData: FormData) => void | Promise<void>
  labels: {
    catalogTitle: string
    catalogDescription: string
    colCode: string
    colName: string
    colDelivery: string
    colStatutory: string
    colState: string
    empty: string
    archive: string
  }
}

export async function TrainingCatalogSection({
  courses,
  orgSlug,
  organizationId,
  isHrmAdmin,
  archiveAction,
  labels,
}: TrainingCatalogSectionProps) {
  const listConfiguration = buildTrainingCatalogListSurfaceConfiguration(
    courses,
    labels
  )
  return (
    <GovernedPatternCListSection
      title={labels.catalogTitle}
      description={labels.catalogDescription}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:training:catalog"
      cardClassName="mt-0"
      trailingColumn={
        isHrmAdmin
          ? {
              header: "",
              Cell: TrainingCatalogTrailingCell,
              context: {
                organizationId,
                orgSlug,
                archiveAction,
                archiveLabel: labels.archive,
                courses: courses.map((course) => ({
                  id: course.id,
                  state: course.state,
                })),
              },
            }
          : undefined
      }
    />
  )
}
