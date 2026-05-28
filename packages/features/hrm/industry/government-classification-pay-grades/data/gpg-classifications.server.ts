import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmGpgClassification } from "@afenda/platform/db/schema"

import { HRM_GPG_AUDIT } from "../gpg.contract"
import type { HrmGpgClassificationScheme } from "../schemas/gpg-workflow-state.shared"
import { formatGpgClassificationLabel } from "./gpg-display.shared"
import { revalidateGpgSurfaces } from "./gpg-revalidate.server"
import type {
  GpgClassificationChoiceRow,
  GpgClassificationRow,
} from "./gpg.types.shared"

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function listGpgClassificationsForOrg(
  organizationId: string
): Promise<GpgClassificationRow[]> {
  const rows = await db.query.hrmGpgClassification.findMany({
    where: eq(hrmGpgClassification.organizationId, organizationId),
    orderBy: [asc(hrmGpgClassification.code)],
  })
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    scheme: row.scheme as GpgClassificationRow["scheme"],
    occupationalGroup: row.occupationalGroup,
    jobSeries: row.jobSeries,
    jobFamily: row.jobFamily,
    agencyRef: row.agencyRef,
    departmentRef: row.departmentRef,
    positionRef: row.positionRef,
    state: row.state as GpgClassificationRow["state"],
    effectiveDate: row.effectiveDate,
  }))
}

export async function listGpgClassificationChoicesForOrg(
  organizationId: string
): Promise<GpgClassificationChoiceRow[]> {
  const rows = await listGpgClassificationsForOrg(organizationId)
  return rows
    .filter((row) => row.state === "active")
    .map((row) => ({
      id: row.id,
      label: formatGpgClassificationLabel(row),
    }))
}

export async function createGpgClassification(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  scheme: HrmGpgClassificationScheme
  effectiveDate: string
  occupationalGroup: string | null
  jobSeries: string | null
  jobFamily: string | null
  agencyRef: string | null
  departmentRef: string | null
  positionRef: string | null
}): Promise<
  { ok: true; classificationId: string } | { ok: false; form?: string }
> {
  const code = input.code.trim().toUpperCase()
  if (!code) {
    return { ok: false, form: "Classification code is required." }
  }

  const existing = await db.query.hrmGpgClassification.findFirst({
    where: and(
      eq(hrmGpgClassification.organizationId, input.organizationId),
      eq(hrmGpgClassification.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return {
      ok: false,
      form: "A classification with this code already exists.",
    }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmGpgClassification).values({
    id,
    organizationId: input.organizationId,
    code,
    name: input.name.trim(),
    scheme: input.scheme,
    effectiveDate: input.effectiveDate,
    occupationalGroup: emptyToNull(input.occupationalGroup),
    jobSeries: emptyToNull(input.jobSeries),
    jobFamily: emptyToNull(input.jobFamily),
    agencyRef: emptyToNull(input.agencyRef),
    departmentRef: emptyToNull(input.departmentRef),
    positionRef: emptyToNull(input.positionRef),
    state: "active",
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.classificationCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_classification",
    resourceId: id,
    metadata: { code },
  })

  revalidateGpgSurfaces()
  return { ok: true, classificationId: id }
}
