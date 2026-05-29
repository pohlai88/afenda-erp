import { z } from "zod"

import { timeClockIngestBatchSchema } from "./tci.schema"

/** Trusted payload for durable time-clock ingest (IDs from gated route / Server Actions only). */
export const tciIngestRunPayloadSchema = z.object({
  organizationId: z.string().uuid(),
  actorUserId: z.string(),
  actorSessionId: z.string().nullable(),
  batch: timeClockIngestBatchSchema,
  ingestAuthKind: z.enum(["integration_api_key", "org_session"]).optional(),
})

export type TciIngestRunPayload = z.infer<typeof tciIngestRunPayloadSchema>
