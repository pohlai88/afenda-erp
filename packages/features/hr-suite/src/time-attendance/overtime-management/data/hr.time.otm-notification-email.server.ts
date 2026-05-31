import { getUserProfile } from "@afenda/db";

/** Best-effort Resend email for HRM-OTM-026 lifecycle events. */
export async function sendHrTimeOtmNotificationEmail(input: {
  recipientAuthUserId: string;
  subject: string;
  body: string;
  actionUrl?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) {
    return { sent: false, reason: "resend_not_configured" };
  }

  const profile = await getUserProfile(input.recipientAuthUserId);
  const to = profile?.email?.trim();
  if (!to) {
    return { sent: false, reason: "recipient_email_missing" };
  }

  const htmlBody = input.actionUrl
    ? `${input.body}<p><a href="${input.actionUrl}">Open overtime</a></p>`
    : input.body;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: input.subject,
        html: htmlBody,
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
