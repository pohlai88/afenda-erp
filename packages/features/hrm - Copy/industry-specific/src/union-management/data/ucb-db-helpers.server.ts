import "server-only"

import { and, desc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmUcbCollectiveAgreement,
  hrmUcbMembership,
} from "@afenda/platform/db/schema"

export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function employeeLabel(
  organizationId: string,
  employeeId: string | null
): Promise<string | null> {
  if (!employeeId) return null
  const row = await db.query.hrmEmployee.findFirst({
    where: and(
      eq(hrmEmployee.organizationId, organizationId),
      eq(hrmEmployee.id, employeeId)
    ),
    columns: { legalName: true, employeeNumber: true },
  })
  if (!row) return null
  return `${row.employeeNumber} — ${row.legalName}`
}

export function isDateInRange(
  asOfDate: string,
  from: Date | null,
  to: Date | null
): boolean {
  if (from) {
    const fromIso = from.toISOString().slice(0, 10)
    if (asOfDate < fromIso) return false
  }
  if (to) {
    const toIso = to.toISOString().slice(0, 10)
    if (asOfDate > toIso) return false
  }
  return true
}

export async function findActiveMembershipForEmployee(input: {
  organizationId: string
  employeeId: string
  asOfDate: string
}) {
  const rows = await db.query.hrmUcbMembership.findMany({
    where: and(
      eq(hrmUcbMembership.organizationId, input.organizationId),
      eq(hrmUcbMembership.employeeId, input.employeeId),
      eq(hrmUcbMembership.status, "active")
    ),
  })
  return (
    rows.find((row) => {
      const start = row.membershipStartDate
        ? row.membershipStartDate.toISOString().slice(0, 10)
        : null
      const end = row.membershipEndDate
        ? row.membershipEndDate.toISOString().slice(0, 10)
        : null
      if (start && input.asOfDate < start) return false
      if (end && input.asOfDate > end) return false
      return true
    }) ?? null
  )
}

export async function findActiveCollectiveAgreementForMembership(input: {
  organizationId: string
  membership: { unionId: string; bargainingUnitId: string | null }
  asOfDate: string
}) {
  const agreements = await db.query.hrmUcbCollectiveAgreement.findMany({
    where: and(
      eq(hrmUcbCollectiveAgreement.organizationId, input.organizationId),
      eq(hrmUcbCollectiveAgreement.unionId, input.membership.unionId),
      eq(hrmUcbCollectiveAgreement.status, "active")
    ),
    orderBy: [desc(hrmUcbCollectiveAgreement.effectiveFrom)],
  })
  return (
    agreements.find((agreement) => {
      if (
        input.membership.bargainingUnitId &&
        agreement.bargainingUnitId &&
        agreement.bargainingUnitId !== input.membership.bargainingUnitId
      ) {
        return false
      }
      return isDateInRange(
        input.asOfDate,
        agreement.effectiveFrom,
        agreement.effectiveTo
      )
    }) ?? null
  )
}
