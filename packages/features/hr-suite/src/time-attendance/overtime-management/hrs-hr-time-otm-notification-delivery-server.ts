import { sendHrTimeOtmNotificationEmail } from "./hrs-hr-time-otm-notification-email-server";

/** Best-effort Ably shell refresh when ABLY_API_KEY is configured (HRM-OTM-026). */
export async function publishHrTimeOtmAblyShellRefresh(input: {
  organizationId: string;
  eventName: string;
  payload?: Record<string, unknown>;
}): Promise<{ published: boolean }> {
  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return { published: false };
  }

  const channel = `org:${input.organizationId}:notifications`;
  const encodedChannel = encodeURIComponent(channel);

  try {
    const response = await fetch(
      `https://rest.ably.io/channels/${encodedChannel}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.eventName,
          data: input.payload ?? {},
        }),
      },
    );

    return { published: response.ok };
  } catch {
    return { published: false };
  }
}

/** Orchestrates email + Ably after in-app notification enqueue (HRM-OTM-026). */
export async function deliverHrTimeOtmOrgNotification(input: {
  organizationId: string;
  recipientAuthUserId: string;
  title: string;
  body: string;
  actionUrl?: string;
  ablyEventName?: string;
  ablyPayload?: Record<string, unknown>;
}): Promise<void> {
  await Promise.all([
    sendHrTimeOtmNotificationEmail({
      recipientAuthUserId: input.recipientAuthUserId,
      subject: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
    }),
    publishHrTimeOtmAblyShellRefresh({
      organizationId: input.organizationId,
      eventName: input.ablyEventName ?? "hrm.overtime.notification",
      payload: {
        recipientAuthUserId: input.recipientAuthUserId,
        title: input.title,
        ...input.ablyPayload,
      },
    }),
  ]);
}
