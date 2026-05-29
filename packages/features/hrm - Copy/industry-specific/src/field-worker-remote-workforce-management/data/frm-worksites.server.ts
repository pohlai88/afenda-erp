import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmFrmWorksite } from "@afenda/platform/db/schema"

import { HRM_FRM_AUDIT } from "../frm.contract"
import type { HrmFrmWorksiteType } from "../schemas/frm-workflow-state.shared"
import { formatFrmWorksiteLabel } from "./frm-display.shared"
import { revalidateFrmSurfaces } from "./frm-revalidate.server"
import type { FrmWorksiteRow } from "./frm.types.shared"

export async function listFrmWorksitesForOrg(
  organizationId: string
): Promise<FrmWorksiteRow[]> {
  const rows = await db.query.hrmFrmWorksite.findMany({
    where: eq(hrmFrmWorksite.organizationId, organizationId),
    orderBy: [asc(hrmFrmWorksite.code)],
  })
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    worksiteType: row.worksiteType as HrmFrmWorksiteType,
    countryCode: row.countryCode,
    city: row.city,
    approvedRemote: row.approvedRemote,
    active: row.active,
  }))
}

export async function listFrmWorksiteChoicesForOrg(organizationId: string) {
  const rows = await listFrmWorksitesForOrg(organizationId)
  return rows
    .filter((row) => row.active)
    .map((row) => ({
      id: row.id,
      label: formatFrmWorksiteLabel(row),
    }))
}

export async function createFrmWorksite(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  worksiteType: HrmFrmWorksiteType
  countryCode: string | null
  city: string | null
  approvedRemote: boolean
}): Promise<{ ok: true; worksiteId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  if (!code) {
    return { ok: false, form: "Worksite code is required." }
  }

  const existing = await db.query.hrmFrmWorksite.findFirst({
    where: and(
      eq(hrmFrmWorksite.organizationId, input.organizationId),
      eq(hrmFrmWorksite.code, code)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A worksite with this code already exists." }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmFrmWorksite).values({
    id,
    organizationId: input.organizationId,
    code,
    name: input.name.trim(),
    worksiteType: input.worksiteType,
    countryCode: input.countryCode?.trim() || null,
    city: input.city?.trim() || null,
    approvedRemote: input.approvedRemote,
    active: true,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.worksiteCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_worksite",
    resourceId: id,
    metadata: { code },
  })

  revalidateFrmSurfaces()
  return { ok: true, worksiteId: id }
}
