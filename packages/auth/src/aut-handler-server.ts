import "server-only";

import { getNeonAuthEnv, isNeonAuthEnabled } from "@afenda/config/env";
import { verifyNeonAuthWebhookPayload } from "../security/webhook-verify.server";
import { neonAuthWebhookEnvelopeSchema } from "./aut-contract";
import { getNeonAuthWebhookHooks } from "./aut-hooks-server";
import {
  parseBlockedSignupEmailDomains,
  resolveUserBeforeCreateResponse,
} from "./aut-policy-server";

const CUSTOM_DELIVERY_BODY = {
  error: "custom_delivery_not_implemented",
  message: "Register onCustomDeliveryRequired or use Neon built-in email delivery.",
} as const;

/** @see https://neon.com/docs/auth/guides/webhooks */
export async function handleNeonAuthWebhookPost(request: Request): Promise<Response> {
  if (!isNeonAuthEnabled()) {
    return Response.json({ error: "neon_auth_disabled" }, { status: 503 });
  }

  const rawBody = await request.text();
  let parsedBody: unknown;
  try {
    parsedBody = await verifyNeonAuthWebhookPayload({ rawBody, headers: request.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook verification failed.";
    return Response.json({ error: message }, { status: 401 });
  }

  const parsed = neonAuthWebhookEnvelopeSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return Response.json({ error: "invalid_payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const registry = getNeonAuthWebhookHooks();
  const blockedDomains = parseBlockedSignupEmailDomains(
    getNeonAuthEnv().NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS,
  );

  switch (payload.event_type) {
    case "user.before_create":
      return Response.json(
        resolveUserBeforeCreateResponse({ email: payload.user?.email, blockedDomains }),
      );

    case "user.created": {
      void registry.onUserCreated?.(payload);
      return Response.json({ ok: true });
    }

    case "phone_number.verified": {
      void registry.onPhoneNumberVerified?.(payload);
      return Response.json({ ok: true });
    }

    case "send.otp":
    case "send.magic_link": {
      const custom = registry.onCustomDeliveryRequired?.(payload);
      if (custom) return custom instanceof Promise ? await custom : custom;
      return Response.json(CUSTOM_DELIVERY_BODY, { status: 400 });
    }

    default:
      return Response.json({ error: "unsupported_event" }, { status: 400 });
  }
}
