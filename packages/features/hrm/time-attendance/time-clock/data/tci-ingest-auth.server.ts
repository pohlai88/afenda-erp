import "server-only"

import { timingSafeEqual } from "node:crypto"
import type { NextRequest } from "next/server"

import { and, eq, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmTimeClockDevice } from "@afenda/platform/db/schema"
import { getOrgSessionFromRequestTrusted } from "@afenda/platform/auth"

import { TCI_API_INGEST_ORG_HEADER } from "../tci-api-ingest.shared"
import {
  resolveTimeClockApiCredentialSha256,
  resolveTimeClockBearerTokenSha256,
} from "../tci-credential-lookup.shared"
import type { TimeClockCommandContext } from "./tci-punch-commands.server"

function constantTimeEqual(expected: string, provided: string): boolean {
  const a = Buffer.from(expected)
  const b = Buffer.from(provided)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function parseBearerToken(authorization: string | null): string | null {
  if (!authorization) return null
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  const token = match?.[1]?.trim()
  return token || null
}

export type TimeClockIngestAuthKind = "org_session" | "integration_api_key"

export type TimeClockIngestActor = {
  readonly ctx: TimeClockCommandContext
  readonly authKind: TimeClockIngestAuthKind
}

async function resolveApiKeyActor(input: {
  organizationId: string
  token: string
}): Promise<TimeClockCommandContext | null> {
  const envKey = process.env.HRM_TIME_CLOCK_INGEST_API_KEY?.trim()
  if (envKey && constantTimeEqual(envKey, input.token)) {
    const actorUserId =
      process.env.HRM_TIME_CLOCK_INGEST_ACTOR_USER_ID?.trim() ?? null
    if (!actorUserId) return null
    return {
      organizationId: input.organizationId,
      userId: actorUserId,
      sessionId: null,
    }
  }

  const tokenSha256 = resolveTimeClockBearerTokenSha256(input.token)

  const [indexed] = await db
    .select({
      id: hrmTimeClockDevice.id,
      integrationCredentialRef: hrmTimeClockDevice.integrationCredentialRef,
      createdByUserId: hrmTimeClockDevice.createdByUserId,
    })
    .from(hrmTimeClockDevice)
    .where(
      and(
        eq(hrmTimeClockDevice.organizationId, input.organizationId),
        eq(hrmTimeClockDevice.state, "active"),
        eq(hrmTimeClockDevice.integrationCredentialSha256, tokenSha256)
      )
    )
    .limit(1)

  type ApiKeyDeviceRow = {
    readonly id: string
    readonly integrationCredentialRef: string | null
    readonly createdByUserId: string | null
    readonly integrationCredentialSha256?: string | null
  }

  let matched: ApiKeyDeviceRow | null = indexed ?? null

  if (
    matched?.integrationCredentialRef &&
    !constantTimeEqual(matched.integrationCredentialRef, input.token)
  ) {
    matched = null
  }

  if (!matched) {
    const devices = await db
      .select({
        id: hrmTimeClockDevice.id,
        integrationCredentialRef: hrmTimeClockDevice.integrationCredentialRef,
        integrationCredentialSha256:
          hrmTimeClockDevice.integrationCredentialSha256,
        createdByUserId: hrmTimeClockDevice.createdByUserId,
      })
      .from(hrmTimeClockDevice)
      .where(
        and(
          eq(hrmTimeClockDevice.organizationId, input.organizationId),
          eq(hrmTimeClockDevice.state, "active")
        )
      )

    for (const row of devices) {
      if (
        row.integrationCredentialRef == null ||
        row.integrationCredentialRef.length === 0 ||
        !constantTimeEqual(row.integrationCredentialRef, input.token)
      ) {
        continue
      }
      matched = row
      const backfillSha = resolveTimeClockApiCredentialSha256(
        row.integrationCredentialRef
      )
      if (backfillSha && row.integrationCredentialSha256 !== backfillSha) {
        await db
          .update(hrmTimeClockDevice)
          .set({
            integrationCredentialSha256: backfillSha,
            updatedAt: sql`now()`,
          })
          .where(eq(hrmTimeClockDevice.id, row.id))
      }
      break
    }
  }

  if (!matched) return null

  const userId =
    process.env.HRM_TIME_CLOCK_INGEST_ACTOR_USER_ID?.trim() ??
    matched.createdByUserId
  if (!userId) return null

  return {
    organizationId: input.organizationId,
    userId,
    sessionId: null,
  }
}

/**
 * Org session (browser) or integration API key (Bearer + organization header).
 */
export async function resolveTimeClockIngestActor(
  request: NextRequest,
  bodyOrganizationId: string
): Promise<TimeClockIngestActor | null> {
  const session = await getOrgSessionFromRequestTrusted(request)
  if (session?.organizationId && session.userId) {
    if (session.organizationId !== bodyOrganizationId) return null
    return {
      authKind: "org_session",
      ctx: {
        organizationId: session.organizationId,
        userId: session.userId,
        sessionId: session.sessionId ?? null,
      },
    }
  }

  const orgHeader = request.headers.get(TCI_API_INGEST_ORG_HEADER)?.trim()
  if (!orgHeader || orgHeader !== bodyOrganizationId) return null

  const token = parseBearerToken(request.headers.get("authorization"))
  if (!token) return null

  const ctx = await resolveApiKeyActor({
    organizationId: bodyOrganizationId,
    token,
  })
  if (!ctx) return null

  return { authKind: "integration_api_key", ctx }
}
