import "server-only"

import { and, eq } from "drizzle-orm"

import { organizationAppsPath } from "@afenda/platform/org-apps-module-paths"
import { db } from "@afenda/platform/db"
import {
  hrmSuccessionCriticalRole,
  hrmSuccessionNomination,
  hrmSuccessionReviewCycle,
} from "@afenda/platform/db/schema"

import { listSuccessionBenchStrength } from "./succession-bench.server"
import { formatSuccessionDateOnly } from "./succession-dates.shared"

export type SuccessionNotificationItem = {
  readonly kind:
    | "missing_successor"
    | "overdue_review"
    | "development_gap"
  readonly title: string
  readonly detail: string
  readonly href: string
}

export async function listSuccessionNotifications(input: {
  organizationId: string
  orgSlug: string
}): Promise<SuccessionNotificationItem[]> {
  const href = `${organizationAppsPath(input.orgSlug, "hrm")}/succession-planning`
  const items: SuccessionNotificationItem[] = []

  const benchRows = await listSuccessionBenchStrength(input.organizationId)
  for (const row of benchRows) {
    if (row.flags.includes("no_ready_successor")) {
      items.push({
        kind: "missing_successor",
        title: `No ready successor — ${row.criticalRoleTitle}`,
        detail: "Add or advance a successor with ready-now readiness.",
        href,
      })
    }
  }

  const overdueCycles = await db.query.hrmSuccessionReviewCycle.findMany({
    where: and(
      eq(hrmSuccessionReviewCycle.organizationId, input.organizationId),
      eq(hrmSuccessionReviewCycle.cycleState, "open")
    ),
    columns: { id: true, title: true, dueDate: true },
  })
  const today = new Date().toISOString().slice(0, 10)
  for (const cycle of overdueCycles) {
    const dueDate = formatSuccessionDateOnly(cycle.dueDate)
    if (dueDate && dueDate < today) {
      items.push({
        kind: "overdue_review",
        title: `Overdue review — ${cycle.title}`,
        detail: "Close or extend the succession review cycle.",
        href,
      })
    }
  }

  const rolesWithoutLinks = await db.query.hrmSuccessionCriticalRole.findMany({
    where: and(
      eq(hrmSuccessionCriticalRole.organizationId, input.organizationId),
      eq(hrmSuccessionCriticalRole.active, true)
    ),
    columns: { id: true, title: true },
    limit: 5,
  })

  for (const role of rolesWithoutLinks) {
    const nominations = await db.query.hrmSuccessionNomination.findMany({
      where: and(
        eq(hrmSuccessionNomination.organizationId, input.organizationId),
        eq(hrmSuccessionNomination.criticalRoleId, role.id),
        eq(hrmSuccessionNomination.status, "active")
      ),
      columns: { readinessLevel: true },
    })
    const hasGap = nominations.some(
      (n) => n.readinessLevel === "future_potential" || n.readinessLevel === "ready_2_3y"
    )
    if (hasGap) {
      items.push({
        kind: "development_gap",
        title: `Development gap — ${role.title}`,
        detail: "Link development plans for long-horizon successors.",
        href,
      })
    }
  }

  return items.slice(0, 20)
}
