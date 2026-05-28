import "server-only"

import { and, asc, desc, eq, sql } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmGpgSalaryTableRow, hrmGpgSalaryTableVersion } from "@afenda/platform/db/schema"

import { HRM_GPG_AUDIT } from "../gpg.contract"
import { formatGpgPayGradeLabel } from "./gpg-display.shared"
import { listGpgPayGradesForOrg } from "./gpg-pay-structure.server"
import { revalidateGpgSurfaces } from "./gpg-revalidate.server"
import type {
  GpgSalaryTableRowRow,
  GpgSalaryTableVersionChoiceRow,
  GpgSalaryTableVersionRow,
} from "./gpg.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listGpgSalaryTableVersionsForOrg(
  organizationId: string
): Promise<GpgSalaryTableVersionRow[]> {
  const versions = await db.query.hrmGpgSalaryTableVersion.findMany({
    where: eq(hrmGpgSalaryTableVersion.organizationId, organizationId),
    orderBy: [
      asc(hrmGpgSalaryTableVersion.code),
      desc(hrmGpgSalaryTableVersion.versionNumber),
    ],
  })
  if (versions.length === 0) {
    return []
  }

  const counts = await db
    .select({
      tableVersionId: hrmGpgSalaryTableRow.tableVersionId,
      rowCount: sql<number>`count(*)::int`,
    })
    .from(hrmGpgSalaryTableRow)
    .where(eq(hrmGpgSalaryTableRow.organizationId, organizationId))
    .groupBy(hrmGpgSalaryTableRow.tableVersionId)

  const countByVersion = new Map(
    counts.map((row) => [row.tableVersionId, row.rowCount] as const)
  )

  return versions.map((row) => ({
    id: row.id,
    code: row.code,
    versionNumber: row.versionNumber,
    effectiveDate: row.effectiveDate,
    state: row.state as GpgSalaryTableVersionRow["state"],
    rowCount: countByVersion.get(row.id) ?? 0,
  }))
}

export async function findGpgDraftSalaryTableVersionForOrg(
  organizationId: string
): Promise<GpgSalaryTableVersionRow | null> {
  const rows = await listGpgSalaryTableVersionsForOrg(organizationId)
  return rows.find((row) => row.state === "draft") ?? null
}

export async function listGpgPublishedSalaryTableVersionChoicesForOrg(
  organizationId: string
): Promise<GpgSalaryTableVersionChoiceRow[]> {
  const rows = await listGpgSalaryTableVersionsForOrg(organizationId)
  return rows
    .filter((row) => row.state === "published")
    .map((row) => ({
      id: row.id,
      label: `${row.code} v${row.versionNumber} (${row.effectiveDate})`,
    }))
}

export async function findGpgSalaryTableRowForGradeStep(input: {
  organizationId: string
  tableVersionId: string
  payGradeId: string
  step: number
}): Promise<GpgSalaryTableRowRow | null> {
  const rows = await listGpgSalaryTableRowsForVersion(
    input.organizationId,
    input.tableVersionId
  )
  return (
    rows.find(
      (row) => row.payGradeId === input.payGradeId && row.step === input.step
    ) ?? null
  )
}

export async function listGpgSalaryTableRowsForVersion(
  organizationId: string,
  tableVersionId: string
): Promise<GpgSalaryTableRowRow[]> {
  const [rows, grades] = await Promise.all([
    db.query.hrmGpgSalaryTableRow.findMany({
      where: and(
        eq(hrmGpgSalaryTableRow.organizationId, organizationId),
        eq(hrmGpgSalaryTableRow.tableVersionId, tableVersionId)
      ),
      orderBy: [asc(hrmGpgSalaryTableRow.step)],
    }),
    listGpgPayGradesForOrg(organizationId),
  ])
  const gradeById = new Map(grades.map((row) => [row.id, row] as const))
  return rows.map((row) => {
    const grade = gradeById.get(row.payGradeId)
    const payGradeLabel = grade ? formatGpgPayGradeLabel(grade) : row.payGradeId
    return {
      id: row.id,
      tableVersionId: row.tableVersionId,
      payGradeId: row.payGradeId,
      payGradeLabel,
      step: row.step,
      baseRate: row.baseRate,
      minRate: row.minRate,
      maxRate: row.maxRate,
      currencyCode: row.currencyCode,
    }
  })
}

async function nextSalaryTableVersionNumber(
  organizationId: string,
  code: string
): Promise<number> {
  const latest = await db.query.hrmGpgSalaryTableVersion.findFirst({
    where: and(
      eq(hrmGpgSalaryTableVersion.organizationId, organizationId),
      eq(hrmGpgSalaryTableVersion.code, code)
    ),
    orderBy: [desc(hrmGpgSalaryTableVersion.versionNumber)],
    columns: { versionNumber: true },
  })
  return (latest?.versionNumber ?? 0) + 1
}

export async function createGpgSalaryTableVersion(input: {
  organizationId: string
  userId: string
  code: string
  effectiveDate: string
}): Promise<
  { ok: true; tableVersionId: string } | { ok: false; form?: string }
> {
  const code = input.code.trim().toUpperCase()
  if (!code) {
    return { ok: false, form: "Salary table code is required." }
  }

  const draftExists = await db.query.hrmGpgSalaryTableVersion.findFirst({
    where: and(
      eq(hrmGpgSalaryTableVersion.organizationId, input.organizationId),
      eq(hrmGpgSalaryTableVersion.state, "draft")
    ),
    columns: { id: true },
  })
  if (draftExists) {
    return {
      ok: false,
      form: "Publish or discard the existing draft before creating another.",
    }
  }

  const versionNumber = await nextSalaryTableVersionNumber(
    input.organizationId,
    code
  )
  const id = crypto.randomUUID()
  await db.insert(hrmGpgSalaryTableVersion).values({
    id,
    organizationId: input.organizationId,
    code,
    versionNumber,
    effectiveDate: input.effectiveDate,
    state: "draft",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.salaryTableVersionCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_salary_table_version",
    resourceId: id,
    metadata: { code, versionNumber },
  })

  revalidateGpgSurfaces()
  return { ok: true, tableVersionId: id }
}

export async function addGpgSalaryTableRow(input: {
  organizationId: string
  userId: string
  tableVersionId: string
  payGradeId: string
  step: number
  baseRate: string
  minRate: string | null
  maxRate: string | null
  currencyCode: string | null
}): Promise<{ ok: true; rowId: string } | { ok: false; form?: string }> {
  const version = await db.query.hrmGpgSalaryTableVersion.findFirst({
    where: and(
      eq(hrmGpgSalaryTableVersion.organizationId, input.organizationId),
      eq(hrmGpgSalaryTableVersion.id, input.tableVersionId)
    ),
  })
  if (!version) {
    return { ok: false, form: "Salary table version not found." }
  }
  if (version.state !== "draft") {
    return {
      ok: false,
      form: "Published salary table rows are immutable. Create a new draft version.",
    }
  }

  if (input.step < 1) {
    return { ok: false, form: "Step must be at least 1." }
  }

  const baseRate = input.baseRate.trim()
  if (!baseRate) {
    return { ok: false, form: "Base rate is required." }
  }

  const duplicate = await db.query.hrmGpgSalaryTableRow.findFirst({
    where: and(
      eq(hrmGpgSalaryTableRow.organizationId, input.organizationId),
      eq(hrmGpgSalaryTableRow.tableVersionId, input.tableVersionId),
      eq(hrmGpgSalaryTableRow.payGradeId, input.payGradeId),
      eq(hrmGpgSalaryTableRow.step, input.step)
    ),
    columns: { id: true },
  })
  if (duplicate) {
    return {
      ok: false,
      form: "A row for this pay grade and step already exists on this version.",
    }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmGpgSalaryTableRow).values({
    id,
    organizationId: input.organizationId,
    tableVersionId: input.tableVersionId,
    payGradeId: input.payGradeId,
    step: input.step,
    baseRate,
    minRate: emptyToNull(input.minRate),
    maxRate: emptyToNull(input.maxRate),
    currencyCode: emptyToNull(input.currencyCode) ?? "USD",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.salaryTableRowCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_salary_table_row",
    resourceId: id,
    metadata: { tableVersionId: input.tableVersionId, step: input.step },
  })

  revalidateGpgSurfaces()
  return { ok: true, rowId: id }
}

export async function publishGpgSalaryTableVersion(input: {
  organizationId: string
  userId: string
  tableVersionId: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const version = await db.query.hrmGpgSalaryTableVersion.findFirst({
    where: and(
      eq(hrmGpgSalaryTableVersion.organizationId, input.organizationId),
      eq(hrmGpgSalaryTableVersion.id, input.tableVersionId)
    ),
  })
  if (!version) {
    return { ok: false, form: "Salary table version not found." }
  }
  if (version.state !== "draft") {
    return { ok: false, form: "Only draft versions can be published." }
  }

  const rowCount = await db.query.hrmGpgSalaryTableRow.findMany({
    where: and(
      eq(hrmGpgSalaryTableRow.organizationId, input.organizationId),
      eq(hrmGpgSalaryTableRow.tableVersionId, input.tableVersionId)
    ),
    columns: { id: true },
  })
  if (rowCount.length === 0) {
    return { ok: false, form: "Add at least one salary row before publishing." }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(hrmGpgSalaryTableVersion)
      .set({
        state: "superseded",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrmGpgSalaryTableVersion.organizationId, input.organizationId),
          eq(hrmGpgSalaryTableVersion.code, version.code),
          eq(hrmGpgSalaryTableVersion.state, "published")
        )
      )

    await tx
      .update(hrmGpgSalaryTableVersion)
      .set({
        state: "published",
        updatedAt: new Date(),
      })
      .where(eq(hrmGpgSalaryTableVersion.id, input.tableVersionId))
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.salaryTableVersionPublish,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_salary_table_version",
    resourceId: input.tableVersionId,
    metadata: { code: version.code, versionNumber: version.versionNumber },
  })

  revalidateGpgSurfaces()
  return { ok: true }
}
