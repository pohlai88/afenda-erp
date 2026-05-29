import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import {
  buildLmsLearningHistoryListSurfaceConfiguration,
  type LmsLearningHistoryListCopy,
} from "../data/lms-learning-history-list-surface.server"
import type { LmsLearningHistoryRow } from "../data/lms-learning-history.queries.server"
import { LMS_LEARNING_HISTORY_SURFACE_KEY } from "../lms-list-surface.shared"

export async function LmsLearningHistorySection({
  rows,
  orgSlug,
  title,
  description,
  labels,
}: {
  rows: readonly LmsLearningHistoryRow[]
  orgSlug: string
  title: string
  description: string
  labels: LmsLearningHistoryListCopy
}) {
  const listConfiguration = buildLmsLearningHistoryListSurfaceConfiguration(
    rows,
    orgSlug,
    labels
  )

  return (
    <GovernedPatternBListSection
      title={title}
      description={description}
      surfaceKey={LMS_LEARNING_HISTORY_SURFACE_KEY}
      listConfiguration={listConfiguration}
      parentAccessAllowed
      resolveConfiguredPermission={false}
    />
  )
}
