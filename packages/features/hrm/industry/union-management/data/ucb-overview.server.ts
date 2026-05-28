import "server-only"

import { and, desc, eq, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmUcbCollectiveAgreement,
  hrmUcbComplianceFinding,
  hrmUcbGrievance,
  hrmUcbMembership,
  hrmUcbUnion,
} from "@afenda/platform/db/schema"

import { employeeLabel } from "./ucb-db-helpers.server"
import type {
  UcbComplianceFindingRow,
  UcbOrgOverviewSummary,
} from "./ucb.types.shared"

const OPEN_GRIEVANCE_STATUSES = [
  "submitted",
  "under_review",
  "meeting_scheduled",
  "pending_decision",
  "escalated",
] as const

export async function summarizeUcbOrgOverview(
  organizationId: string
): Promise<UcbOrgOverviewSummary> {
  const [unions, agreements, memberships, grievances, findings] =
    await Promise.all([
      db.query.hrmUcbUnion.findMany({
        where: and(
          eq(hrmUcbUnion.organizationId, organizationId),
          eq(hrmUcbUnion.status, "active")
        ),
        columns: { id: true },
      }),
      db.query.hrmUcbCollectiveAgreement.findMany({
        where: eq(hrmUcbCollectiveAgreement.organizationId, organizationId),
        columns: { id: true, status: true, effectiveTo: true },
      }),
      db.query.hrmUcbMembership.findMany({
        where: and(
          eq(hrmUcbMembership.organizationId, organizationId),
          eq(hrmUcbMembership.status, "active")
        ),
        columns: { id: true },
      }),
      db.query.hrmUcbGrievance.findMany({
        where: eq(hrmUcbGrievance.organizationId, organizationId),
        columns: { id: true, status: true },
      }),
      db.query.hrmUcbComplianceFinding.findMany({
        where: and(
          eq(hrmUcbComplianceFinding.organizationId, organizationId),
          isNull(hrmUcbComplianceFinding.resolvedAt)
        ),
        columns: { id: true, severity: true },
      }),
    ])

  const today = new Date().toISOString().slice(0, 10)
  const expiringWindow = new Date()
  expiringWindow.setDate(expiringWindow.getDate() + 90)

  const expiringAgreements = agreements.filter((row) => {
    if (row.status !== "active" || !row.effectiveTo) return false
    const to = row.effectiveTo.toISOString().slice(0, 10)
    return to >= today && to <= expiringWindow.toISOString().slice(0, 10)
  }).length

  return {
    activeUnions: unions.length,
    activeAgreements: agreements.filter((a) => a.status === "active").length,
    activeMemberships: memberships.length,
    openGrievances: grievances.filter((g) =>
      (OPEN_GRIEVANCE_STATUSES as readonly string[]).includes(g.status)
    ).length,
    expiringAgreements,
    unresolvedComplianceFindings: findings.length,
  }
}

export async function listUcbComplianceFindingsForOrg(
  organizationId: string
): Promise<UcbComplianceFindingRow[]> {
  const rows = await db.query.hrmUcbComplianceFinding.findMany({
    where: eq(hrmUcbComplianceFinding.organizationId, organizationId),
    orderBy: [desc(hrmUcbComplianceFinding.createdAt)],
  })

  const result: UcbComplianceFindingRow[] = []
  for (const row of rows) {
    const [empLabel, agreementTitle] = await Promise.all([
      row.employeeId
        ? employeeLabel(organizationId, row.employeeId)
        : Promise.resolve(null),
      row.collectiveAgreementId
        ? db.query.hrmUcbCollectiveAgreement
            .findFirst({
              where: eq(hrmUcbCollectiveAgreement.id, row.collectiveAgreementId),
              columns: { title: true },
            })
            .then((a) => a?.title ?? null)
        : Promise.resolve(null),
    ])
    result.push({
      id: row.id,
      findingCode: row.findingCode,
      severity: row.severity,
      message: row.message,
      employeeId: row.employeeId,
      employeeLabel: empLabel,
      agreementTitle,
      resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    })
  }
  return result
}
