import { processStripeWebhookEvent } from "./stripe-billing.server";

export async function handleStripeWebhookPost(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  try {
    const result = await processStripeWebhookEvent({ rawBody, signature });
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe webhook processing failed.";

    return Response.json({ error: message }, { status: 400 });
  }
}
