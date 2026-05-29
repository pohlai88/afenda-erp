import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmUcbMembership,
  hrmUcbSeniorityProfile,
  hrmUcbSeniorityRule,
} from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { employeeLabel } from "./ucb-db-helpers.server"
import { rankUcbSeniorityProfiles } from "./ucb-seniority-rank.shared"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbSeniorityProfileRow } from "./ucb.types.shared"

export async function listUcbSeniorityProfilesForOrg(
  organizationId: string
): Promise<UcbSeniorityProfileRow[]> {
  const profiles = await db.query.hrmUcbSeniorityProfile.findMany({
    where: eq(hrmUcbSeniorityProfile.organizationId, organizationId),
    orderBy: [asc(hrmUcbSeniorityProfile.seniorityDate)],
  })

  const result: UcbSeniorityProfileRow[] = []
  for (const profile of profiles) {
    const membership = await db.query.hrmUcbMembership.findFirst({
      where: eq(hrmUcbMembership.id, profile.membershipId),
      columns: { employeeId: true },
    })
    const label = membership
      ? await employeeLabel(organizationId, membership.employeeId)
      : null
    result.push({
      id: profile.id,
      membershipId: profile.membershipId,
      employeeId: membership?.employeeId ?? profile.membershipId,
      employeeLabel: label ?? profile.membershipId,
      seniorityDate: profile.seniorityDate.toISOString().slice(0, 10),
      computedRank: profile.computedRank,
    })
  }
  return result
}

export async function upsertUcbSeniorityProfile(input: {
  organizationId: string
  userId: string
  membershipId: string
  seniorityDate: string
}): Promise<{ ok: true; seniorityProfileId: string } | { ok: false; form?: string }> {
  const membership = await db.query.hrmUcbMembership.findFirst({
    where: and(
      eq(hrmUcbMembership.organizationId, input.organizationId),
      eq(hrmUcbMembership.id, input.membershipId)
    ),
    columns: { id: true, employeeId: true },
  })
  if (!membership) return { ok: false, form: "Membership not found." }

  const existing = await db.query.hrmUcbSeniorityProfile.findFirst({
    where: eq(hrmUcbSeniorityProfile.membershipId, input.membershipId),
  })

  const seniorityDate = new Date(input.seniorityDate)
  if (existing) {
    await db
      .update(hrmUcbSeniorityProfile)
      .set({
        seniorityDate,
        rankComputedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hrmUcbSeniorityProfile.id, existing.id))

    await writeIamAuditEventFromNextHeaders({
      action: HRM_UCB_AUDIT.seniorityUpdate,
      actorUserId: input.userId,
      organizationId: input.organizationId,
      resourceType: "hrm_ucb_seniority_profile",
      resourceId: existing.id,
      metadata: {},
    })

    revalidateUcbSurfaces()
    return { ok: true, seniorityProfileId: existing.id }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmUcbSeniorityProfile).values({
    id,
    organizationId: input.organizationId,
    membershipId: input.membershipId,
    seniorityDate,
    rankComputedAt: new Date(),
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.seniorityUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_seniority_profile",
    resourceId: id,
    metadata: { membershipId: input.membershipId },
  })

  revalidateUcbSurfaces()
  return { ok: true, seniorityProfileId: id }
}

export async function recomputeUcbSeniorityRanksForOrg(
  organizationId: string
): Promise<void> {
  const profiles = await listUcbSeniorityProfilesForOrg(organizationId)
  const ranked = rankUcbSeniorityProfiles(
    profiles.map((row) => ({
      membershipId: row.membershipId,
      employeeId: row.membershipId,
      employeeLabel: row.employeeLabel,
      seniorityDate: row.seniorityDate,
    }))
  )
  for (const row of ranked) {
    const profile = await db.query.hrmUcbSeniorityProfile.findFirst({
      where: eq(hrmUcbSeniorityProfile.membershipId, row.membershipId),
      columns: { id: true },
    })
    if (!profile) continue
    await db
      .update(hrmUcbSeniorityProfile)
      .set({
        computedRank: row.rank,
        rankComputedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hrmUcbSeniorityProfile.id, profile.id))
  }
}

export async function listUcbSeniorityRulesForAgreement(
  organizationId: string,
  collectiveAgreementId: string
): Promise<
  Array<{
    id: string
    useCase: string
    tieBreakRule: string
    active: boolean
  }>
> {
  const rows = await db.query.hrmUcbSeniorityRule.findMany({
    where: and(
      eq(hrmUcbSeniorityRule.organizationId, organizationId),
      eq(hrmUcbSeniorityRule.collectiveAgreementId, collectiveAgreementId)
    ),
  })
  return rows.map((row) => ({
    id: row.id,
    useCase: row.useCase,
    tieBreakRule: row.tieBreakRule,
    active: row.active,
  }))
}
