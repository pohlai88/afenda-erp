import { getTranslations } from "next-intl/server"

import Link from "next/link"
import type { Route } from "next"

import { tciBandSectionHref } from "../tci-search-params.shared"
import type { TimeClockKpiSummary } from "../data/tci.queries.server"

type TimeClockKpiAttentionLinksProps = {
  summary: TimeClockKpiSummary
}

export async function TimeClockKpiAttentionLinks({
  summary,
}: TimeClockKpiAttentionLinksProps) {
  const t = await getTranslations("Erp.Hrm.timeClock.kpi.attentionLinks")

  const links: { href: string; label: string }[] = []

  if (summary.failedSyncDevices > 0) {
    links.push({
      href: tciBandSectionHref("operations"),
      label: t("failedSync", { count: summary.failedSyncDevices }),
    })
  }
  if (
    summary.pendingExceptions > 0 ||
    summary.missingPunchDays > 0 ||
    summary.duplicatePunchInbox > 0 ||
    summary.abnormalPunchDays > 0 ||
    summary.abnormalPunchInbox > 0 ||
    summary.correctionQueueOpen > 0
  ) {
    links.push({
      href: tciBandSectionHref("quality"),
      label: t("qualityAttention"),
    })
  }

  if (links.length === 0) {
    return null
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      data-testid="time-clock-kpi-attention-links"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href as Route}
          prefetch={false}
          className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
