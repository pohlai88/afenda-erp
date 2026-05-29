import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  buildLmsCoursesListSurfaceConfiguration,
  type LmsCoursesListCopy,
} from "../data/lms-list-surface.server"
import type { HrmLmsCourseRow } from "../data/lms.types.shared"
import { LMS_COURSES_SURFACE_KEY } from "../lms-list-surface.shared"

import { LmsCatalogTrailingCell } from "./lms-list-trailing-cells.client"

type LmsCatalogSectionProps = {
  courses: readonly HrmLmsCourseRow[]
  orgSlug: string
  organizationId: string
  canManage: boolean
  canRead: boolean
  archiveAction: (formData: FormData) => void | Promise<void>
  labels: LmsCoursesListCopy & { archive: string }
}

export async function LmsCatalogSection({
  courses,
  orgSlug,
  organizationId,
  canManage,
  canRead,
  archiveAction,
  labels,
}: LmsCatalogSectionProps) {
  const listConfiguration = buildLmsCoursesListSurfaceConfiguration(
    courses,
    labels,
    { showTrailing: canManage }
  )

  return (
    <section id="lms-catalog-section" data-testid="lms-catalog-section">
      <GovernedPatternCListSection
        title={labels.catalogTitle}
        description={labels.catalogDescription}
        listConfiguration={listConfiguration}
        surfaceKey={LMS_COURSES_SURFACE_KEY}
        cardClassName="mt-0"
        parentAccessAllowed={canRead}
        trailingColumn={
          canManage
            ? {
                header: "",
                Cell: LmsCatalogTrailingCell,
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
    </section>
  )
}
