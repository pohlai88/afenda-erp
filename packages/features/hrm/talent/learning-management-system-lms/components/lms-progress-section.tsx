import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import {
  buildLmsProgressListSurfaceConfiguration,
  type LmsProgressListCopy,
} from "../data/lms-progress-list-surface.server"
import type { HrmLmsProgressRow } from "../data/lms.types.shared"
import { LMS_PROGRESS_SURFACE_KEY } from "../lms-list-surface.shared"

export async function LmsProgressSection({
  progressRows,
  orgSlug,
  title,
  description,
  labels,
}: {
  progressRows: readonly HrmLmsProgressRow[]
  orgSlug: string
  title: string
  description: string
  labels: LmsProgressListCopy
}) {
  const listConfiguration = buildLmsProgressListSurfaceConfiguration(
    progressRows,
    orgSlug,
    labels
  )

  return (
    <section id="lms-progress-section" data-testid="lms-progress-section">
      <GovernedPatternBListSection
        title={title}
        description={description}
        surfaceKey={LMS_PROGRESS_SURFACE_KEY}
        listConfiguration={listConfiguration}
        parentAccessAllowed
        resolveConfiguredPermission={false}
      />
    </section>
  )
}
