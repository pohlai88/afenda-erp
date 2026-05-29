import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmFhcOutlet } from "@afenda/platform/db/schema"

import { HRM_FHC_AUDIT } from "../fhc.contract"
import { revalidateFhcSurfaces } from "./fhc-revalidate.server"

export async function createFhcOutlet(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  outletKind?: string
  countryCode?: string | null
}): Promise<{ ok: true; outletId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  const name = input.name.trim()
  if (!code || !name) {
    return { ok: false, form: "Outlet code and name are required." }
  }

  const existing = await db.query.hrmFhcOutlet.findFirst({
    where: and(
      eq(hrmFhcOutlet.organizationId, input.organizationId),
      eq(hrmFhcOutlet.code, code),
      isNull(hrmFhcOutlet.archivedAt)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "An outlet with this code already exists." }
  }

  const outletId = crypto.randomUUID()
  await db.insert(hrmFhcOutlet).values({
    id: outletId,
    organizationId: input.organizationId,
    code,
    name,
    outletKind: input.outletKind?.trim() || "restaurant",
    countryCode: input.countryCode?.trim() || null,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FHC_AUDIT.outletCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "food_handler_compliance_outlet",
    resourceId: outletId,
    metadata: { code },
  })

  revalidateFhcSurfaces()
  return { ok: true, outletId }
}
