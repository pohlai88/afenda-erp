import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmUcbCbaRule, hrmUcbDuesReference } from "@afenda/platform/db/schema"

import type { HrmUcbRuleDomain } from "../schemas/ucb-workflow-state.shared"
import {
  filterUcbRuleRefsByDomains,
  mapCbaRuleToExportRow,
  UCB_LEAVE_RULE_DOMAINS,
  UCB_OVERTIME_RULE_DOMAINS,
  UCB_PAYROLL_RULE_DOMAINS,
  UCB_SCHEDULING_RULE_DOMAINS,
} from "./ucb-rule-reference.shared"
import {
  findActiveCollectiveAgreementForMembership,
  findActiveMembershipForEmployee,
} from "./ucb-db-helpers.server"
import { rankUcbSeniorityProfiles } from "./ucb-seniority-rank.shared"
import type {
  UcbApprovedDuesPayrollRow,
  UcbRuleRefExportRow,
  UcbSeniorityPriorityRow,
} from "./ucb.types.shared"
import { employeeLabel } from "./ucb-db-helpers.server"
import { hrmUcbMembership, hrmUcbSeniorityProfile } from "@afenda/platform/db/schema"

async function listActiveRuleRefsForEmployee(input: {
  organizationId: string
  employeeId: string
  asOfDate: string
  domains: readonly HrmUcbRuleDomain[]
}): Promise<UcbRuleRefExportRow[]> {
  const membership = await findActiveMembershipForEmployee(input)
  if (!membership) return []

  const agreement = await findActiveCollectiveAgreementForMembership({
    organizationId: input.organizationId,
    membership: {
      unionId: membership.unionId,
      bargainingUnitId: membership.bargainingUnitId,
    },
    asOfDate: input.asOfDate,
  })
  if (!agreement) return []

  const rules = await db.query.hrmUcbCbaRule.findMany({
    where: and(
      eq(hrmUcbCbaRule.organizationId, input.organizationId),
      eq(hrmUcbCbaRule.collectiveAgreementId, agreement.id),
      eq(hrmUcbCbaRule.active, true)
    ),
  })

  return filterUcbRuleRefsByDomains(
    rules.map((row) =>
      mapCbaRuleToExportRow({
        id: row.id,
        collectiveAgreementId: row.collectiveAgreementId,
        ruleDomain: row.ruleDomain,
        externalRuleCode: row.externalRuleCode,
        summary: row.summary,
      })
    ),
    input.domains
  )
}

export async function listUcbPayrollRuleRefsForEmployee(input: {
  organizationId: string
  employeeId: string
  asOfDate: string
}): Promise<UcbRuleRefExportRow[]> {
  return listActiveRuleRefsForEmployee({
    ...input,
    domains: UCB_PAYROLL_RULE_DOMAINS,
  })
}

export async function listUcbOvertimeRuleRefsForEmployee(input: {
  organizationId: string
  employeeId: string
  asOfDate: string
}): Promise<UcbRuleRefExportRow[]> {
  return listActiveRuleRefsForEmployee({
    ...input,
    domains: UCB_OVERTIME_RULE_DOMAINS,
  })
}

export async function listUcbLeaveRuleRefsForEmployee(input: {
  organizationId: string
  employeeId: string
  asOfDate: string
}): Promise<UcbRuleRefExportRow[]> {
  return listActiveRuleRefsForEmployee({
    ...input,
    domains: UCB_LEAVE_RULE_DOMAINS,
  })
}

export async function listUcbSchedulingRuleRefsForEmployee(input: {
  organizationId: string
  employeeId: string
  asOfDate: string
}): Promise<UcbRuleRefExportRow[]> {
  return listActiveRuleRefsForEmployee({
    ...input,
    domains: UCB_SCHEDULING_RULE_DOMAINS,
  })
}

export async function listSeniorityPriorityForUseCase(input: {
  organizationId: string
  bargainingUnitId: string
  useCase: string
  asOfDate: string
}): Promise<UcbSeniorityPriorityRow[]> {
  const memberships = await db.query.hrmUcbMembership.findMany({
    where: and(
      eq(hrmUcbMembership.organizationId, input.organizationId),
      eq(hrmUcbMembership.bargainingUnitId, input.bargainingUnitId),
      eq(hrmUcbMembership.status, "active")
    ),
  })

  const profiles: Array<{
    membershipId: string
    employeeId: string
    employeeLabel: string
    seniorityDate: string
  }> = []

  for (const membership of memberships) {
    const profile = await db.query.hrmUcbSeniorityProfile.findFirst({
      where: eq(hrmUcbSeniorityProfile.membershipId, membership.id),
    })
    if (!profile) continue
    const label = await employeeLabel(input.organizationId, membership.employeeId)
    profiles.push({
      membershipId: membership.id,
      employeeId: membership.employeeId,
      employeeLabel: label ?? membership.employeeId,
      seniorityDate: profile.seniorityDate.toISOString().slice(0, 10),
    })
  }

  const ranked = rankUcbSeniorityProfiles(profiles)
  return ranked.map((row) => ({
    employeeId: row.employeeId,
    employeeLabel: row.employeeLabel,
    seniorityDate: row.seniorityDate,
    rank: row.rank,
  }))
}

export async function listApprovedUnionDuesForPayroll(input: {
  organizationId: string
  asOfDate: string
}): Promise<UcbApprovedDuesPayrollRow[]> {
  const rows = await db.query.hrmUcbDuesReference.findMany({
    where: and(
      eq(hrmUcbDuesReference.organizationId, input.organizationId),
      eq(hrmUcbDuesReference.approvalState, "approved")
    ),
  })

  const result: UcbApprovedDuesPayrollRow[] = []
  for (const row of rows) {
    if (row.effectiveFrom) {
      const from = row.effectiveFrom.toISOString().slice(0, 10)
      if (input.asOfDate < from) continue
    }
    const membership = await db.query.hrmUcbMembership.findFirst({
      where: eq(hrmUcbMembership.id, row.membershipId),
      columns: { employeeId: true },
    })
    if (!membership) continue
    result.push({
      duesReferenceId: row.id,
      membershipId: row.membershipId,
      employeeId: membership.employeeId,
      amountRef: row.amountRef,
      currencyCode: row.currencyCode,
      effectiveFrom: row.effectiveFrom
        ? row.effectiveFrom.toISOString().slice(0, 10)
        : null,
    })
  }
  return result
}
