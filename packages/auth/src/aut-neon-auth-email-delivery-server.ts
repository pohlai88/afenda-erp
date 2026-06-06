import "server-only";

import type { NeonAuthWebhookEnvelope } from "./aut-contract";

type NeonAuthDeliveryResult =
  | { sent: true }
  | { sent: false; reason: string };

type DeliveryVariant = {
  subject: string;
  html: string;
  text: string;
};

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey || !from) {
    return { configured: false as const };
  }

  return { configured: true as const, apiKey, from };
}

function toStringValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getEventDataValue(
  payload: NeonAuthWebhookEnvelope,
  keys: readonly string[],
) {
  const data = payload.event_data;
  if (!data) return undefined;

  for (const key of keys) {
    const value = toStringValue(data[key]);
    if (value) return value;
  }

  return undefined;
}

function getRecipientEmail(payload: NeonAuthWebhookEnvelope): string | undefined {
  return (
    toStringValue(payload.user?.email) ??
    getEventDataValue(payload, ["email", "recipient", "to"])
  );
}

function getDeliveryType(payload: NeonAuthWebhookEnvelope): string | undefined {
  return getEventDataValue(payload, ["type", "delivery_type", "flow", "purpose"]);
}

function getOtpValue(payload: NeonAuthWebhookEnvelope): string | undefined {
  return getEventDataValue(payload, ["otp", "code", "passcode", "token"]);
}

function getMagicLinkUrl(payload: NeonAuthWebhookEnvelope): string | undefined {
  return getEventDataValue(payload, ["url", "link", "callbackURL", "callback_url"]);
}

function buildOtpDelivery(input: { type?: string; otp: string }): DeliveryVariant {
  const flowLabel =
    input.type === "sign-in"
      ? "sign-in"
      : input.type === "forget-password"
        ? "password reset"
        : "email verification";

  return {
    subject: `Your Afenda ${flowLabel} code`,
    text: [
      `Use this code to complete your ${flowLabel}: ${input.otp}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: [
      `<p>Use this code to complete your ${flowLabel}: <strong>${input.otp}</strong></p>`,
      "<p>If you did not request this, you can ignore this email.</p>",
    ].join(""),
  };
}

function buildMagicLinkDelivery(input: { url: string }): DeliveryVariant {
  return {
    subject: "Your Afenda sign-in link",
    text: [
      "Use the link below to sign in to Afenda:",
      input.url,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: [
      "<p>Use the link below to sign in to Afenda:</p>",
      `<p><a href="${input.url}">${input.url}</a></p>`,
      "<p>If you did not request this, you can ignore this email.</p>",
    ].join(""),
  };
}

async function sendResendDeliveryEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<NeonAuthDeliveryResult> {
  const config = getResendConfig();
  if (!config.configured) {
    return { sent: false, reason: "resend_not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      return { sent: false, reason: `resend_http_${response.status}` };
    }

    return { sent: true };
  } catch {
    return { sent: false, reason: "resend_request_failed" };
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

export async function handleNeonAuthCustomDeliveryRequired(
  payload: NeonAuthWebhookEnvelope,
): Promise<Response> {
  const to = getRecipientEmail(payload);
  if (!to) {
    return jsonResponse({ error: "recipient_email_missing" }, 400);
  }

  switch (payload.event_type) {
    case "send.otp": {
      const otp = getOtpValue(payload);
      if (!otp) {
        return jsonResponse({ error: "otp_missing" }, 400);
      }

      const delivery = buildOtpDelivery({
        type: getDeliveryType(payload),
        otp,
      });
      const result = await sendResendDeliveryEmail({
        to,
        ...delivery,
      });

      if (!result.sent) {
        const status = result.reason === "resend_not_configured" ? 503 : 502;
        return jsonResponse(
          { error: "custom_otp_delivery_failed", reason: result.reason },
          status,
        );
      }

      return jsonResponse({ ok: true, delivered: "otp" });
    }

    case "send.magic_link": {
      const url = getMagicLinkUrl(payload);
      if (!url) {
        return jsonResponse({ error: "magic_link_url_missing" }, 400);
      }

      const delivery = buildMagicLinkDelivery({ url });
      const result = await sendResendDeliveryEmail({
        to,
        ...delivery,
      });

      if (!result.sent) {
        const status = result.reason === "resend_not_configured" ? 503 : 502;
        return jsonResponse(
          { error: "custom_magic_link_delivery_failed", reason: result.reason },
          status,
        );
      }

      return jsonResponse({ ok: true, delivered: "magic_link" });
    }

    default:
      return jsonResponse({ error: "unsupported_delivery_event" }, 400);
  }
}
