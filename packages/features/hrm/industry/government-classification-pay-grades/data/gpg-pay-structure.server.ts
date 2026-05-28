import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmGpgClassification,
  hrmGpgPayBand,
  hrmGpgPayGrade,
} from "@afenda/platform/db/schema"

import { HRM_GPG_AUDIT } from "../gpg.contract"
import {
  formatGpgClassificationLabel,
  formatGpgGsSesRefs,
  formatGpgPayBandLabel,
  formatGpgPayGradeLabel,
} from "./gpg-display.shared"
import { listGpgClassificationsForOrg } from "./gpg-classifications.server"
import { revalidateGpgSurfaces } from "./gpg-revalidate.server"
import type {
  GpgPayBandRow,
  GpgPayGradeChoiceRow,
  GpgPayGradeRow,
} from "./gpg.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listGpgPayGradesForOrg(
  organizationId: string
): Promise<GpgPayGradeRow[]> {
  const [grades, classifications] = await Promise.all([
    db.query.hrmGpgPayGrade.findMany({
      where: eq(hrmGpgPayGrade.organizationId, organizationId),
      orderBy: [asc(hrmGpgPayGrade.code)],
    }),
    listGpgClassificationsForOrg(organizationId),
  ])
  const classificationById = new Map(
    classifications.map((row) => [row.id, row] as const)
  )
  return grades.map((row) => {
    const classification = classificationById.get(row.classificationId)
    const classificationLabel = classification
      ? formatGpgClassificationLabel(classification)
      : row.classificationId
    return {
      id: row.id,
      classificationId: row.classificationId,
      classificationLabel,
      code: row.code,
      name: row.name,
      gsEquivalent: row.gsEquivalent,
      sesEquivalent: row.sesEquivalent,
      civilServiceGradeRef: row.civilServiceGradeRef,
      rankEquivalent: row.rankEquivalent,
      state: row.state as GpgPayGradeRow["state"],
      effectiveDate: row.effectiveDate,
    }
  })
}

export async function listGpgPayGradeChoicesForOrg(
  organizationId: string
): Promise<GpgPayGradeChoiceRow[]> {
  const rows = await listGpgPayGradesForOrg(organizationId)
  return rows
    .filter((row) => row.state === "active")
    .map((row) => ({
      id: row.id,
      label: formatGpgPayGradeLabel(row),
    }))
}

export async function listGpgPayBandChoicesForOrg(
  organizationId: string
): Promise<GpgPayGradeChoiceRow[]> {
  const rows = await listGpgPayBandsForOrg(organizationId)
  return rows
    .filter((row) => row.state === "active")
    .map((row) => ({
      id: row.id,
      label: formatGpgPayBandLabel(row),
    }))
}

export async function listGpgPayBandsForOrg(
  organizationId: string
): Promise<GpgPayBandRow[]> {
  const [bands, grades] = await Promise.all([
    db.query.hrmGpgPayBand.findMany({
      where: eq(hrmGpgPayBand.organizationId, organizationId),
      orderBy: [asc(hrmGpgPayBand.code)],
    }),
    listGpgPayGradesForOrg(organizationId),
  ])
  const gradeById = new Map(grades.map((row) => [row.id, row] as const))
  return bands.map((row) => {
    const grade = gradeById.get(row.payGradeId)
    const payGradeLabel = grade ? formatGpgPayGradeLabel(grade) : row.payGradeId
    return {
      id: row.id,
      payGradeId: row.payGradeId,
      payGradeLabel,
      code: row.code,
      name: row.name,
      minRate: row.minRate,
      maxRate: row.maxRate,
      currencyCode: row.currencyCode,
      state: row.state as GpgPayBandRow["state"],
      effectiveDate: row.effectiveDate,
    }
  })
}

export async function createGpgPayGrade(input: {
  organizationId: string
  userId: string
  classificationId: string
  code: string
  name: string
  effectiveDate: string
  gsEquivalent: string | null
  sesEquivalent: string | null
  civilServiceGradeRef: string | null
  rankEquivalent: string | null
}): Promise<{ ok: true; payGradeId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  if (!code) {
    return { ok: false, form: "Pay grade code is required." }
  }

  const classification = await db.query.hrmGpgClassification.findFirst({
    where: and(
      eq(hrmGpgClassification.organizationId, input.organizationId),
      eq(hrmGpgClassification.id, input.classificationId)
    ),
    columns: { id: true },
  })
  if (!classification) {
    return { ok: false, form: "Classification not found." }
  }

  const existing = await db.query.hrmGpgPayGrade.findFirst({
    where: and(
      eq(hrmGpgPayGrade.organizationId, input.organizationId),
      eq(hrmGpgPayGrade.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A pay grade with this code already exists." }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmGpgPayGrade).values({
    id,
    organizationId: input.organizationId,
    classificationId: input.classificationId,
    code,
    name: input.name.trim(),
    effectiveDate: input.effectiveDate,
    gsEquivalent: emptyToNull(input.gsEquivalent),
    sesEquivalent: emptyToNull(input.sesEquivalent),
    civilServiceGradeRef: emptyToNull(input.civilServiceGradeRef),
    rankEquivalent: emptyToNull(input.rankEquivalent),
    state: "active",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.payGradeCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade",
    resourceId: id,
    metadata: {
      code,
      gsSes: formatGpgGsSesRefs({
        gsEquivalent: emptyToNull(input.gsEquivalent),
        sesEquivalent: emptyToNull(input.sesEquivalent),
        civilServiceGradeRef: emptyToNull(input.civilServiceGradeRef),
        rankEquivalent: emptyToNull(input.rankEquivalent),
      }),
    },
  })

  revalidateGpgSurfaces()
  return { ok: true, payGradeId: id }
}

export async function createGpgPayBand(input: {
  organizationId: string
  userId: string
  payGradeId: string
  code: string
  name: string
  effectiveDate: string
  minRate: string | null
  maxRate: string | null
  currencyCode: string | null
}): Promise<{ ok: true; payBandId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  if (!code) {
    return { ok: false, form: "Pay band code is required." }
  }

  const grade = await db.query.hrmGpgPayGrade.findFirst({
    where: and(
      eq(hrmGpgPayGrade.organizationId, input.organizationId),
      eq(hrmGpgPayGrade.id, input.payGradeId)
    ),
    columns: { id: true },
  })
  if (!grade) {
    return { ok: false, form: "Pay grade not found." }
  }

  const existing = await db.query.hrmGpgPayBand.findFirst({
    where: and(
      eq(hrmGpgPayBand.organizationId, input.organizationId),
      eq(hrmGpgPayBand.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A pay band with this code already exists." }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmGpgPayBand).values({
    id,
    organizationId: input.organizationId,
    payGradeId: input.payGradeId,
    code,
    name: input.name.trim(),
    effectiveDate: input.effectiveDate,
    minRate: emptyToNull(input.minRate),
    maxRate: emptyToNull(input.maxRate),
    currencyCode: emptyToNull(input.currencyCode) ?? "USD",
    state: "active",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.payBandCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_band",
    resourceId: id,
    metadata: { code },
  })

  revalidateGpgSurfaces()
  return { ok: true, payBandId: id }
}
