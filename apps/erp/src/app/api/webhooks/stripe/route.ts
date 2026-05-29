import { processStripeWebhookEvent } from "@afenda/billing/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  try {
    const result = await processStripeWebhookEvent({
      rawBody,
      signature,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe webhook processing failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
