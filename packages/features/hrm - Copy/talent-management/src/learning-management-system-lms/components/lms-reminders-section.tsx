import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import {
  buildLmsRemindersListSurfaceConfiguration,
  type LmsRemindersListCopy,
} from "../data/lms-reminders-list-surface.server"
import type { HrmLmsReminderRow } from "../data/lms.types.shared"
import { LMS_REMINDERS_SURFACE_KEY } from "../lms-list-surface.shared"

export async function LmsRemindersSection({
  reminders,
  orgSlug,
  title,
  description,
  labels,
}: {
  reminders: readonly HrmLmsReminderRow[]
  orgSlug: string
  title: string
  description: string
  labels: LmsRemindersListCopy
}) {
  const listConfiguration = buildLmsRemindersListSurfaceConfiguration(
    reminders,
    orgSlug,
    labels
  )

  return (
    <section id="lms-reminders-section" data-testid="lms-reminders-section">
      <GovernedPatternBListSection
        title={title}
        description={description}
        surfaceKey={LMS_REMINDERS_SURFACE_KEY}
        listConfiguration={listConfiguration}
        parentAccessAllowed
        resolveConfiguredPermission={false}
      />
    </section>
  )
}
