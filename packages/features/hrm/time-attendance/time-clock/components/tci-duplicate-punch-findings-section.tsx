import { buildTimeClockDuplicatePunchFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import { TCI_LIST_SURFACE_IDS } from "../data/tci-surface-metadata.shared"
import type { TimeClockDuplicatePunchFindingRow } from "../data/tci-duplicate-detection.server"
import type { TimeClockLoadError } from "../data/tci-load-error.shared"
import {
  renderTimeClockLamDayFindingsSection,
  type TimeClockLamDayFindingsSectionConfig,
} from "./tci-lam-day-findings-section"

const DUPLICATE_PUNCH_FINDINGS_CONFIG = {
  messageNamespace: "Erp.Hrm.timeClock.duplicatePunchFindings",
  codeLabelsNamespace: "Erp.Hrm.timeClock.duplicateSequenceCodeLabels",
  surfaceKey: TCI_LIST_SURFACE_IDS.duplicatePunchFindings,
  buildListConfiguration:
    buildTimeClockDuplicatePunchFindingsListSurfaceConfiguration,
} as const satisfies TimeClockLamDayFindingsSectionConfig<TimeClockDuplicatePunchFindingRow>

export async function TimeClockDuplicatePunchFindingsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockDuplicatePunchFindingRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  return renderTimeClockLamDayFindingsSection({
    rows,
    orgSlug,
    parentAccessAllowed,
    loadError,
    config: DUPLICATE_PUNCH_FINDINGS_CONFIG,
  })
}
