import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildLmsLearningPathsListSurfaceConfiguration } from "../data/lms-learning-paths-list-surface.server"
import type { LmsLearningPathsListCopy } from "../data/lms-learning-paths-list-surface.server"
import type { HrmLmsLearningPathRow } from "../data/lms.types.shared"
import { LMS_LEARNING_PATHS_SURFACE_KEY } from "../lms-list-surface.shared"

import { LmsPathsTrailingCell } from "./lms-path-list-trailing-cells.client"

type LmsLearningPathsSectionProps = {
  paths: readonly HrmLmsLearningPathRow[]
  orgSlug: string
  organizationId: string
  canManage: boolean
  canRead: boolean
  archiveAction: (formData: FormData) => void | Promise<void>
  labels: LmsLearningPathsListCopy & { archive: string }
}

export async function LmsLearningPathsSection({
  paths,
  orgSlug,
  organizationId,
  canManage,
  canRead,
  archiveAction,
  labels,
}: LmsLearningPathsSectionProps) {
  const listConfiguration = buildLmsLearningPathsListSurfaceConfiguration(
    paths,
    labels,
    { showTrailing: canManage }
  )

  return (
    <GovernedPatternCListSection
      title={labels.pathsTitle}
      description={labels.pathsDescription}
      listConfiguration={listConfiguration}
      surfaceKey={LMS_LEARNING_PATHS_SURFACE_KEY}
      cardClassName="mt-0"
      parentAccessAllowed={canRead}
      trailingColumn={
        canManage
          ? {
              header: "",
              Cell: LmsPathsTrailingCell,
              context: {
                organizationId,
                orgSlug,
                archiveAction,
                archiveLabel: labels.archive,
                paths: paths.map((path) => ({
                  id: path.id,
                  state: path.state,
                })),
              },
            }
          : undefined
      }
    />
  )
}
