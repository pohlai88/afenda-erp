import "server-only"

import {
  buildGovernedStatGrid,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"
import { tciBandSectionHref } from "../../tci-search-params.shared"
import type { TimeClockKpiSummary } from "../tci.queries.server"

export type TimeClockKpiStatGroupConfigurations = {
  registry: StatCardConfigurationInput
  quality: StatCardConfigurationInput
  downstream: StatCardConfigurationInput
}

export function buildTimeClockKpiStatGroupConfigurations(
  summary: TimeClockKpiSummary,
  copy: {
    registry: {
      activeDevices: string
      activeMappings: string
      punchesToday: string
      failedSync: string
    }
    quality: {
      pendingExceptions: string
      missingPunchDays: string
      duplicatePunchInbox: string
      abnormalPunchDays: string
      abnormalPunchInbox: string
      correctionQueueOpen: string
    }
    downstream: {
      shiftEvaluatedToday: string
      lamExposedToday: string
      workHourDaysToday: string
      payrollReadyDaysToday: string
    }
  }
): TimeClockKpiStatGroupConfigurations {
  return {
    registry: buildGovernedStatGrid({
      presentationProfile: "erp-kpi-grid",
      dataNature: "snapshot-summary",
      stats: [
        {
          label: copy.registry.activeDevices,
          value: String(summary.activeDevices),
          icon: "shield",
          tone: "default",
          href: tciBandSectionHref("setup"),
        },
        {
          label: copy.registry.activeMappings,
          value: String(summary.activeMappings),
          icon: "users",
          tone: "default",
          href: tciBandSectionHref("setup"),
        },
        {
          label: copy.registry.punchesToday,
          value: String(summary.punchesToday),
          icon: "activity",
          tone: "default",
          href: tciBandSectionHref("capture"),
        },
        {
          label: copy.registry.failedSync,
          value: String(summary.failedSyncDevices),
          icon: "alert",
          tone: summary.failedSyncDevices > 0 ? "attention" : "default",
          href: tciBandSectionHref("operations"),
        },
      ],
    }),
    quality: buildGovernedStatGrid({
      presentationProfile: "erp-kpi-grid",
      dataNature: "snapshot-summary",
      stats: [
        {
          label: copy.quality.pendingExceptions,
          value: String(summary.pendingExceptions),
          icon: "alert",
          tone: summary.pendingExceptions > 0 ? "attention" : "default",
          href: tciBandSectionHref("quality"),
        },
        {
          label: copy.quality.missingPunchDays,
          value: String(summary.missingPunchDays),
          icon: "calendar",
          tone: summary.missingPunchDays > 0 ? "attention" : "default",
          href: tciBandSectionHref("quality"),
        },
        {
          label: copy.quality.duplicatePunchInbox,
          value: String(summary.duplicatePunchInbox),
          icon: "alert",
          tone: summary.duplicatePunchInbox > 0 ? "attention" : "default",
          href: tciBandSectionHref("quality"),
        },
        {
          label: copy.quality.abnormalPunchDays,
          value: String(summary.abnormalPunchDays),
          icon: "activity",
          tone: summary.abnormalPunchDays > 0 ? "attention" : "default",
          href: tciBandSectionHref("quality"),
        },
        {
          label: copy.quality.abnormalPunchInbox,
          value: String(summary.abnormalPunchInbox),
          icon: "alert",
          tone: summary.abnormalPunchInbox > 0 ? "attention" : "default",
          href: tciBandSectionHref("quality"),
        },
        {
          label: copy.quality.correctionQueueOpen,
          value: String(summary.correctionQueueOpen),
          icon: "clock",
          tone: summary.correctionQueueOpen > 0 ? "attention" : "default",
          href: tciBandSectionHref("quality"),
        },
      ],
    }),
    downstream: buildGovernedStatGrid({
      presentationProfile: "erp-kpi-grid",
      dataNature: "snapshot-summary",
      stats: [
        {
          label: copy.downstream.shiftEvaluatedToday,
          value: String(summary.shiftEvaluatedToday),
          icon: "clock",
          tone: "default",
          href: tciBandSectionHref("downstream"),
        },
        {
          label: copy.downstream.lamExposedToday,
          value: String(summary.lamExposedToday),
          icon: "activity",
          tone: "default",
          href: tciBandSectionHref("downstream"),
        },
        {
          label: copy.downstream.workHourDaysToday,
          value: String(summary.workHourDaysToday),
          icon: "calendar",
          tone: "default",
          href: tciBandSectionHref("downstream"),
        },
        {
          label: copy.downstream.payrollReadyDaysToday,
          value: String(summary.payrollReadyDaysToday),
          icon: "shield",
          tone: "default",
          href: tciBandSectionHref("downstream"),
        },
      ],
    }),
  }
}
