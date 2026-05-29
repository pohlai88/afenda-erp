import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmMscMachine, hrmMscSite } from "@afenda/platform/db/schema"

import { HRM_MSC_AUDIT } from "../msc.contract"
import { revalidateMscSurfaces } from "./msc-revalidate.server"

export async function createMscSite(input: {
  organizationId: string
  userId: string
  code: string
  name: string
  countryCode?: string | null
  oshaRecordkeepingEnabled?: boolean
}): Promise<{ ok: true; siteId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  const name = input.name.trim()
  if (!code || !name) {
    return { ok: false, form: "Site code and name are required." }
  }

  const existing = await db.query.hrmMscSite.findFirst({
    where: and(
      eq(hrmMscSite.organizationId, input.organizationId),
      eq(hrmMscSite.code, code),
      isNull(hrmMscSite.archivedAt)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A site with this code already exists." }
  }

  const country = input.countryCode?.trim().toUpperCase() || null
  if (country && !/^[A-Z]{2}$/.test(country)) {
    return {
      ok: false,
      form: "Country code must be a two-letter ISO code (e.g. US).",
    }
  }

  const siteId = crypto.randomUUID()
  await db.insert(hrmMscSite).values({
    id: siteId,
    organizationId: input.organizationId,
    code,
    name,
    countryCode: country,
    oshaRecordkeepingEnabled: input.oshaRecordkeepingEnabled ?? false,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.siteCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_site",
    resourceId: siteId,
    metadata: { code },
  })

  revalidateMscSurfaces()
  return { ok: true, siteId }
}

export async function createMscMachine(input: {
  organizationId: string
  userId: string
  siteId: string | null
  code: string
  name: string
}): Promise<{ ok: true; machineId: string } | { ok: false; form?: string }> {
  const code = input.code.trim().toUpperCase()
  const name = input.name.trim()
  if (!code || !name) {
    return { ok: false, form: "Machine code and name are required." }
  }

  if (input.siteId) {
    const site = await db.query.hrmMscSite.findFirst({
      where: eq(hrmMscSite.id, input.siteId),
      columns: { id: true, organizationId: true },
    })
    if (!site || site.organizationId !== input.organizationId) {
      return { ok: false, form: "Site was not found." }
    }
  }

  const existing = await db.query.hrmMscMachine.findFirst({
    where: and(
      eq(hrmMscMachine.organizationId, input.organizationId),
      eq(hrmMscMachine.code, code),
      isNull(hrmMscMachine.archivedAt)
    ),
    columns: { id: true },
  })
  if (existing) {
    return { ok: false, form: "A machine with this code already exists." }
  }

  const machineId = crypto.randomUUID()
  await db.insert(hrmMscMachine).values({
    id: machineId,
    organizationId: input.organizationId,
    siteId: input.siteId,
    code,
    name,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_MSC_AUDIT.machineCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "manufacturing_safety_machine",
    resourceId: machineId,
    metadata: { code },
  })

  revalidateMscSurfaces()
  return { ok: true, machineId }
}
