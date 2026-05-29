import "server-only"

import { and, asc, desc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmUcbBargainingUnit,
  hrmUcbCollectiveAgreement,
  hrmUcbUnion,
} from "@afenda/platform/db/schema"

import { HRM_UCB_AUDIT } from "../ucb.contract"
import { revalidateUcbSurfaces } from "./ucb-revalidate.server"
import type { UcbCollectiveAgreementRow } from "./ucb.types.shared"

function formatDate(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null
}

async function unionLabel(organizationId: string, unionId: string): Promise<string> {
  const row = await db.query.hrmUcbUnion.findFirst({
    where: and(
      eq(hrmUcbUnion.organizationId, organizationId),
      eq(hrmUcbUnion.id, unionId)
    ),
    columns: { code: true, name: true },
  })
  return row ? `${row.code} — ${row.name}` : unionId
}

async function bargainingUnitLabel(
  organizationId: string,
  bargainingUnitId: string | null
): Promise<string | null> {
  if (!bargainingUnitId) return null
  const row = await db.query.hrmUcbBargainingUnit.findFirst({
    where: and(
      eq(hrmUcbBargainingUnit.organizationId, organizationId),
      eq(hrmUcbBargainingUnit.id, bargainingUnitId)
    ),
    columns: { code: true, name: true },
  })
  return row ? `${row.code} — ${row.name}` : bargainingUnitId
}

function mapAgreementRow(
  row: typeof hrmUcbCollectiveAgreement.$inferSelect,
  unionLabelValue: string,
  unitLabel: string | null
): UcbCollectiveAgreementRow {
  return {
    id: row.id,
    unionId: row.unionId,
    unionLabel: unionLabelValue,
    bargainingUnitId: row.bargainingUnitId,
    bargainingUnitLabel: unitLabel,
    title: row.title,
    versionLabel: row.versionLabel,
    effectiveFrom: formatDate(row.effectiveFrom),
    effectiveTo: formatDate(row.effectiveTo),
    status: row.status as UcbCollectiveAgreementRow["status"],
    negotiationStatus: row.negotiationStatus,
  }
}

export async function listUcbCollectiveAgreementsForOrg(
  organizationId: string
): Promise<UcbCollectiveAgreementRow[]> {
  const rows = await db.query.hrmUcbCollectiveAgreement.findMany({
    where: eq(hrmUcbCollectiveAgreement.organizationId, organizationId),
    orderBy: [desc(hrmUcbCollectiveAgreement.effectiveFrom)],
  })
  const result: UcbCollectiveAgreementRow[] = []
  for (const row of rows) {
    const uLabel = await unionLabel(organizationId, row.unionId)
    const buLabel = await bargainingUnitLabel(organizationId, row.bargainingUnitId)
    result.push(mapAgreementRow(row, uLabel, buLabel))
  }
  return result
}

export async function listUcbCollectiveAgreementChoicesForOrg(
  organizationId: string
): Promise<Array<{ id: string; label: string }>> {
  const rows = await listUcbCollectiveAgreementsForOrg(organizationId)
  return rows
    .filter((row) => row.status === "active" || row.status === "draft")
    .map((row) => ({
      id: row.id,
      label: `${row.title} (${row.versionLabel})`,
    }))
}

export async function createUcbCollectiveAgreement(input: {
  organizationId: string
  userId: string
  unionId: string
  bargainingUnitId: string | null
  title: string
  versionLabel: string
  effectiveFrom: string | null
  effectiveTo: string | null
  status: string
  negotiationStatus: string
}): Promise<{ ok: true; collectiveAgreementId: string } | { ok: false; form?: string }> {
  const union = await db.query.hrmUcbUnion.findFirst({
    where: and(
      eq(hrmUcbUnion.organizationId, input.organizationId),
      eq(hrmUcbUnion.id, input.unionId)
    ),
    columns: { id: true },
  })
  if (!union) return { ok: false, form: "Union not found." }

  const id = crypto.randomUUID()
  await db.insert(hrmUcbCollectiveAgreement).values({
    id,
    organizationId: input.organizationId,
    unionId: input.unionId,
    bargainingUnitId: input.bargainingUnitId,
    title: input.title.trim(),
    versionLabel: input.versionLabel.trim(),
    effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
    effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
    status: input.status,
    negotiationStatus: input.negotiationStatus,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.cbaCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_collective_agreement",
    resourceId: id,
    metadata: { title: input.title },
  })

  revalidateUcbSurfaces()
  return { ok: true, collectiveAgreementId: id }
}

export async function updateUcbCollectiveAgreement(input: {
  organizationId: string
  userId: string
  collectiveAgreementId: string
  bargainingUnitId: string | null
  title: string
  versionLabel: string
  effectiveFrom: string | null
  effectiveTo: string | null
  status: string
  negotiationStatus: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const row = await db.query.hrmUcbCollectiveAgreement.findFirst({
    where: and(
      eq(hrmUcbCollectiveAgreement.organizationId, input.organizationId),
      eq(hrmUcbCollectiveAgreement.id, input.collectiveAgreementId)
    ),
    columns: { id: true },
  })
  if (!row) return { ok: false, form: "Collective agreement not found." }

  await db
    .update(hrmUcbCollectiveAgreement)
    .set({
      bargainingUnitId: input.bargainingUnitId,
      title: input.title.trim(),
      versionLabel: input.versionLabel.trim(),
      effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
      effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
      status: input.status,
      negotiationStatus: input.negotiationStatus,
      updatedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmUcbCollectiveAgreement.id, input.collectiveAgreementId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_UCB_AUDIT.cbaUpdate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "hrm_ucb_collective_agreement",
    resourceId: input.collectiveAgreementId,
    metadata: {},
  })

  revalidateUcbSurfaces()
  return { ok: true }
}

export async function listUcbBargainingUnitsForUnion(input: {
  organizationId: string
  unionId: string
}): Promise<
  Array<{
    id: string
    code: string
    name: string
    active: boolean
  }>
> {
  const rows = await db.query.hrmUcbBargainingUnit.findMany({
    where: and(
      eq(hrmUcbBargainingUnit.organizationId, input.organizationId),
      eq(hrmUcbBargainingUnit.unionId, input.unionId)
    ),
    orderBy: [asc(hrmUcbBargainingUnit.code)],
  })
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    active: row.active,
  }))
}
