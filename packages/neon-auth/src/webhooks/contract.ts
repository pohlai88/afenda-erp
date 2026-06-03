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

const neonWebhookContextSchema = z
  .object({
    endpoint_id: z.string().optional(),
    project_name: z.string().optional(),
  })
  .passthrough()
  .optional();

const neonSendOtpEventDataSchema = z
  .object({
    otp: z.string().optional(),
    delivery_preference: z.enum(["email", "sms"]).optional(),
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
  })
  .passthrough();

const neonSendMagicLinkEventDataSchema = z
  .object({
    url: z.string().url().optional(),
    email: z.string().email().optional(),
  })
  .passthrough();

const neonUserEventDataSchema = z.record(z.string(), z.unknown()).optional();

export const neonAuthWebhookEventDataSchema = z.union([
  neonSendOtpEventDataSchema,
  neonSendMagicLinkEventDataSchema,
  neonUserEventDataSchema,
]);

export const neonAuthWebhookEnvelopeSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.enum(neonAuthWebhookEventTypes),
  timestamp: z.string(),
  context: neonWebhookContextSchema,
  user: neonWebhookUserSchema.optional(),
  event_data: neonAuthWebhookEventDataSchema.optional(),
});

export type NeonAuthWebhookEnvelope = z.infer<typeof neonAuthWebhookEnvelopeSchema>;

export const neonAuthWebhookBeforeCreateResponseSchema = z.object({
  allowed: z.boolean(),
  error_message: z.string().max(500).optional(),
  error_code: z.string().optional(),
});

export type NeonAuthWebhookBeforeCreateResponse = z.infer<
  typeof neonAuthWebhookBeforeCreateResponseSchema
>;

export function isNeonSmsOtpWebhook(payload: NeonAuthWebhookEnvelope) {
  return (
    payload.event_type === "send.otp" &&
    payload.event_data != null &&
    typeof payload.event_data === "object" &&
    "delivery_preference" in payload.event_data &&
    payload.event_data.delivery_preference === "sms"
  );
}
