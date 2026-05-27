import { getVercelDrainSecret } from "@afenda/config/env";
import {
  getRequestId,
  logServerEvent,
  summarizeDrainPayload,
  verifyVercelSignature,
} from "@afenda/observability";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const route = "/api/observability/drain";
  const requestId = getRequestId(request);
  const context = {
    requestId,
    module: "observability",
    operation: "drain.ingest",
  };
  const signatureSecret = getVercelDrainSecret();

  if (!signatureSecret) {
    logServerEvent("error", "Drain secret is not configured.", context, {
      route,
      status: 503,
    });

    return NextResponse.json(
      { error: "Drain endpoint is not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-vercel-signature");

  if (
    !(await verifyVercelSignature({
      rawBody,
      signature,
      secret: signatureSecret,
    }))
  ) {
    logServerEvent("warn", "Drain signature rejected.", context, {
      route,
      status: 403,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      { code: "invalid_signature", error: "Invalid drain signature." },
      { status: 403 },
    );
  }

  const payloadSummary = summarizeDrainPayload(rawBody);

  logServerEvent("info", "Drain payload accepted.", context, {
    route,
    status: 200,
    durationMs: Date.now() - startedAt,
    ...payloadSummary,
  });

  return NextResponse.json({
    success: true,
    ...payloadSummary,
  });
}
