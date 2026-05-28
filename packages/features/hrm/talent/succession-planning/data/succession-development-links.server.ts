import "server-only"

import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmDevelopmentPlan,
  hrmSuccessionDevelopmentLink,
  hrmSuccessionNomination,
} from "@afenda/platform/db/schema"

import { HRM_SUCCESSION_AUDIT } from "../succession.contract"
import { revalidateSuccessionSurfaces } from "./succession-revalidate.server"
import type { SuccessionDevelopmentLinkRow } from "./succession.types.shared"

export async function listSuccessionDevelopmentLinksForNomination(
  organizationId: string,
  nominationId: string
): Promise<SuccessionDevelopmentLinkRow[]> {
  const rows = await db.query.hrmSuccessionDevelopmentLink.findMany({
    where: and(
      eq(hrmSuccessionDevelopmentLink.organizationId, organizationId),
      eq(hrmSuccessionDevelopmentLink.nominationId, nominationId)
    ),
  })
  return rows.map((row) => ({
    id: row.id,
    nominationId: row.nominationId,
    developmentPlanId: row.developmentPlanId,
    linkStatus: row.linkStatus,
    progressPercent: row.progressPercent,
  }))
}

export async function listSuccessionDevelopmentLinksForOrg(
  organizationId: string
): Promise<SuccessionDevelopmentLinkRow[]> {
  const rows = await db.query.hrmSuccessionDevelopmentLink.findMany({
    where: eq(hrmSuccessionDevelopmentLink.organizationId, organizationId),
  })
  return rows.map((row) => ({
    id: row.id,
    nominationId: row.nominationId,
    developmentPlanId: row.developmentPlanId,
    linkStatus: row.linkStatus,
    progressPercent: row.progressPercent,
  }))
}

export async function createSuccessionDevelopmentLink(input: {
  organizationId: string
  userId: string
  nominationId: string
  developmentPlanId: string
}): Promise<{ ok: true; linkId: string } | { ok: false; form?: string }> {
  const nomination = await db.query.hrmSuccessionNomination.findFirst({
    where: and(
      eq(hrmSuccessionNomination.organizationId, input.organizationId),
      eq(hrmSuccessionNomination.id, input.nominationId)
    ),
    columns: { id: true, candidateEmployeeId: true },
  })
  if (!nomination) {
    return { ok: false, form: "Nomination not found." }
  }

  const plan = await db.query.hrmDevelopmentPlan.findFirst({
    where: and(
      eq(hrmDevelopmentPlan.organizationId, input.organizationId),
      eq(hrmDevelopmentPlan.id, input.developmentPlanId),
      eq(hrmDevelopmentPlan.employeeId, nomination.candidateEmployeeId)
    ),
    columns: { id: true },
  })
  if (!plan) {
    return {
      ok: false,
      form: "Development plan must belong to the nominated employee.",
    }
  }

  const existing = await db.query.hrmSuccessionDevelopmentLink.findFirst({
    where: and(
      eq(hrmSuccessionDevelopmentLink.nominationId, input.nominationId),
      eq(hrmSuccessionDevelopmentLink.developmentPlanId, input.developmentPlanId)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "This development plan is already linked." }
  }

  const linkId = crypto.randomUUID()
  await db.insert(hrmSuccessionDevelopmentLink).values({
    id: linkId,
    organizationId: input.organizationId,
    nominationId: input.nominationId,
    developmentPlanId: input.developmentPlanId,
    linkStatus: "active",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_SUCCESSION_AUDIT.developmentLinkCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_succession_development_link",
    resourceId: linkId,
    metadata: {
      nominationId: input.nominationId,
      developmentPlanId: input.developmentPlanId,
    },
  })

  revalidateSuccessionSurfaces()
  return { ok: true, linkId }
}
