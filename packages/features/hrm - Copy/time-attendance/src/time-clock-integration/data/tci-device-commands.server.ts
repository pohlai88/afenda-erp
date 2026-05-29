import "server-only"

import { and, eq, sql } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmTimeClockDevice } from "@afenda/platform/db/schema"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { HRM_TCI_AUDIT } from "../tci.contract"
import type { UpsertTimeClockDeviceFormInput } from "../schemas/tci.schema"

import { requireTimeClockDeviceAdminPermission } from "./tci-device-admin-access.server"
import {
  revalidateTimeClockSurfaces,
  updateTimeClockOrgCacheTag,
} from "./tci-revalidate.server"
import { resolveTimeClockApiCredentialSha256 } from "../tci-credential-lookup.shared"
import {
  findTimeClockDeviceByExternalId,
  getTimeClockDeviceForOrg,
} from "./tci.queries.server"
import type { TimeClockCommandContext } from "./tci-punch-commands.server"

export type TimeClockDeviceMutationResult =
  | { ok: true; deviceId: string }
  | { ok: false; errors: Record<string, string | undefined> }

export async function upsertTimeClockDevice(
  ctx: TimeClockCommandContext,
  input: UpsertTimeClockDeviceFormInput
): Promise<TimeClockDeviceMutationResult> {
  const access = await requireTimeClockDeviceAdminPermission()
  if (!access.ok) {
    return hrmActionFailure({ form: access.error })
  }
  if (
    access.session.organizationId !== ctx.organizationId ||
    access.session.userId !== ctx.userId
  ) {
    return hrmActionFailure({
      form: "Session does not match device admin authority.",
    })
  }

  const existingByExternal = await findTimeClockDeviceByExternalId({
    organizationId: ctx.organizationId,
    externalDeviceId: input.externalDeviceId,
  })

  if (existingByExternal && existingByExternal.id !== input.id) {
    return hrmActionFailure({
      externalDeviceId: "External device ID already registered.",
    })
  }

  const isUpdate = Boolean(input.id)
  const deviceId = input.id ?? crypto.randomUUID()

  if (isUpdate) {
    const existing = await getTimeClockDeviceForOrg(
      ctx.organizationId,
      deviceId
    )
    if (!existing) {
      return hrmActionFailure({ form: "Device not found." })
    }
    if (existing.state === "revoked") {
      return hrmActionFailure({
        form: "Revoked devices cannot be edited. Register a new device instead.",
      })
    }
  }

  const integrationCredentialRef = input.integrationCredentialRef ?? null
  const values = {
    organizationId: ctx.organizationId,
    externalDeviceId: input.externalDeviceId.trim(),
    name: input.name.trim(),
    deviceType: input.deviceType,
    locationRef: input.locationRef ?? null,
    state: input.state ?? "active",
    integrationCredentialRef,
    integrationCredentialSha256: resolveTimeClockApiCredentialSha256(
      integrationCredentialRef
    ),
    updatedByUserId: ctx.userId,
    updatedAt: new Date(),
  }

  if (isUpdate) {
    await db
      .update(hrmTimeClockDevice)
      .set(values)
      .where(
        and(
          eq(hrmTimeClockDevice.id, deviceId),
          eq(hrmTimeClockDevice.organizationId, ctx.organizationId)
        )
      )
  } else {
    await db.insert(hrmTimeClockDevice).values({
      id: deviceId,
      ...values,
      createdByUserId: ctx.userId,
    })
  }

  await writeIamAuditEventFromNextHeaders({
    action: isUpdate ? HRM_TCI_AUDIT.deviceUpdate : HRM_TCI_AUDIT.deviceCreate,
    actorUserId: ctx.userId,
    actorSessionId: ctx.sessionId,
    organizationId: ctx.organizationId,
    resourceType: "hrm_time_clock_device",
    resourceId: deviceId,
    metadata: {
      externalDeviceId: values.externalDeviceId,
      state: values.state,
    },
  })

  updateTimeClockOrgCacheTag(ctx.organizationId)
  revalidateTimeClockSurfaces(ctx.organizationId)
  return { ok: true, deviceId }
}

export async function revokeTimeClockDevice(
  ctx: TimeClockCommandContext,
  deviceId: string
): Promise<TimeClockDeviceMutationResult> {
  const access = await requireTimeClockDeviceAdminPermission()
  if (!access.ok) {
    return hrmActionFailure({ form: access.error })
  }
  if (
    access.session.organizationId !== ctx.organizationId ||
    access.session.userId !== ctx.userId
  ) {
    return hrmActionFailure({
      form: "Session does not match device admin authority.",
    })
  }

  const existing = await db.query.hrmTimeClockDevice.findFirst({
    where: and(
      eq(hrmTimeClockDevice.organizationId, ctx.organizationId),
      eq(hrmTimeClockDevice.id, deviceId)
    ),
  })
  if (!existing) {
    return hrmActionFailure({ deviceId: "Device not found." })
  }

  await db
    .update(hrmTimeClockDevice)
    .set({
      state: "revoked",
      syncStatus: "idle",
      updatedByUserId: ctx.userId,
      updatedAt: sql`now()`,
    })
    .where(eq(hrmTimeClockDevice.id, deviceId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_TCI_AUDIT.deviceRevoke,
    actorUserId: ctx.userId,
    actorSessionId: ctx.sessionId,
    organizationId: ctx.organizationId,
    resourceType: "hrm_time_clock_device",
    resourceId: deviceId,
    metadata: {},
  })

  updateTimeClockOrgCacheTag(ctx.organizationId)
  revalidateTimeClockSurfaces(ctx.organizationId)
  return { ok: true, deviceId }
}
