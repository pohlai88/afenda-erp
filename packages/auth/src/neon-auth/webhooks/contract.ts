import { z } from "zod";

export const neonAuthWebhookEventTypes = [
  "send.otp",
  "send.magic_link",
  "user.before_create",
  "user.created",
  "phone_number.verified",
] as const;

export type NeonAuthWebhookEventType = (typeof neonAuthWebhookEventTypes)[number];

const neonWebhookUserSchema = z
  .object({
    id: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    phone_number: z.string().optional(),
    image: z.string().optional(),
    email_verified: z.boolean().optional(),
    phone_number_verified: z.boolean().optional(),
    created_at: z.string().optional(),
  })
  .passthrough();

export const neonAuthWebhookEnvelopeSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.enum(neonAuthWebhookEventTypes),
  timestamp: z.string(),
  context: z.record(z.string(), z.unknown()).optional(),
  user: neonWebhookUserSchema.optional(),
  event_data: z.record(z.string(), z.unknown()).optional(),
});

export type NeonAuthWebhookEnvelope = z.infer<typeof neonAuthWebhookEnvelopeSchema>;
