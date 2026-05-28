import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmUcbCbaRule, hrmUcbCollectiveAgreement } from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbCbaRuleRow } from "./ucb.types.shared"

export async function listUcbCbaRulesForOrg(
  organizationId: string
): Promise<UcbCbaRuleRow[]> {
  const rows = await db.query.hrmUcbCbaRule.findMany({
    where: eq(hrmUcbCbaRule.organizationId, organizationId),
    orderBy: [asc(hrmUcbCbaRule.ruleDomain), asc(hrmUcbCbaRule.externalRuleCode)],
  })

  const agreementTitles = new Map<string, string>()
  const result: UcbCbaRuleRow[] = []
  for (const row of rows) {
    let title = agreementTitles.get(row.collectiveAgreementId)
    if (!title) {
      const agreement = await db.query.hrmUcbCollectiveAgreement.findFirst({
        where: eq(hrmUcbCollectiveAgreement.id, row.collectiveAgreementId),
        columns: { title: true },
      })
      title = agreement?.title ?? row.collectiveAgreementId
      agreementTitles.set(row.collectiveAgreementId, title)
    }
    result.push({
      id: row.id,
      collectiveAgreementId: row.collectiveAgreementId,
      agreementTitle: title,
      ruleDomain: row.ruleDomain as UcbCbaRuleRow["ruleDomain"],
      externalRuleCode: row.externalRuleCode,
      summary: row.summary,
      active: row.active,
    })
  }
  return result
}

export async function createUcbCbaRule(input: {
  organizationId: string
  userId: string
  collectiveAgreementId: string
  ruleDomain: string
  externalRuleCode: string
  summary: string
}): Promise<{ ok: true; cbaRuleId: string } | { ok: false; form?: string }> {
  const agreement = await db.query.hrmUcbCollectiveAgreement.findFirst({
    where: and(
      eq(hrmUcbCollectiveAgreement.organizationId, input.organizationId),
      eq(hrmUcbCollectiveAgreement.id, input.collectiveAgreementId)
    ),
    columns: { id: true },
  })
  if (!agreement) return { ok: false, form: "Collective agreement not found." }

  const id = crypto.randomUUID()
  await db.insert(hrmUcbCbaRule).values({
    id,
    organizationId: input.organizationId,
    collectiveAgreementId: input.collectiveAgreementId,
    ruleDomain: input.ruleDomain,
    externalRuleCode: input.externalRuleCode.trim(),
    summary: input.summary.trim(),
    active: true,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.cbaRuleCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_cba_rule",
    resourceId: id,
    metadata: { ruleDomain: input.ruleDomain },
  })

  revalidateUcbSurfaces()
  return { ok: true, cbaRuleId: id }
}

export async function updateUcbCbaRule(input: {
  organizationId: string
  userId: string
  cbaRuleId: string
  ruleDomain: string
  externalRuleCode: string
  summary: string
  active: boolean
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const row = await db.query.hrmUcbCbaRule.findFirst({
    where: and(
      eq(hrmUcbCbaRule.organizationId, input.organizationId),
      eq(hrmUcbCbaRule.id, input.cbaRuleId)
    ),
    columns: { id: true },
  })
  if (!row) return { ok: false, form: "CBA rule not found." }

  await db
    .update(hrmUcbCbaRule)
    .set({
      ruleDomain: input.ruleDomain,
      externalRuleCode: input.externalRuleCode.trim(),
      summary: input.summary.trim(),
      active: input.active,
      updatedAt: new Date(),
    })
    .where(eq(hrmUcbCbaRule.id, input.cbaRuleId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.cbaRuleUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_cba_rule",
    resourceId: input.cbaRuleId,
    metadata: {},
  })

  revalidateUcbSurfaces()
  return { ok: true }
}
