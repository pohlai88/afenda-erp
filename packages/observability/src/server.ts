import "server-only";

import { createDomainLogger } from "./logger/create-domain-logger";
import type {
  ServerLogContext,
  ServerLogLevel,
  ServerLogMetadata,
  StructuralLogEvent,
} from "./logger/logger.types";
import {
  getRequestId,
  summarizeDrainPayload,
  verifyVercelSignature,
} from "./index";

export {
  getRequestId,
  summarizeDrainPayload,
  verifyVercelSignature,
} from "./index";
export { getLoggingHealth } from "./diagnostics/logging-health";
export {
  hasStructuralLogContract,
  hasStructuredLogEvent,
} from "./diagnostics/logging-contract-check";
export { createNextRequestLogger } from "./middleware/next-request-logger.server";
export { withRouteHandlerLogger } from "./middleware/route-handler-logger.server";
export { withServerActionLogger } from "./middleware/server-action-logger.server";
export * from "./logger";

export function logServerEvent(
  level: ServerLogLevel,
  message: string,
  context: ServerLogContext,
  metadata: ServerLogMetadata = {},
) {
  try {
    const logger = createDomainLogger(context.module, context);
    const event = {
      event: `${context.module}.${context.operation}`,
      ...context,
      ...metadata,
    } satisfies StructuralLogEvent;

    logger[level](event, message);
  } catch {
    // Runtime diagnostics must never block business execution.
  }
}

export async function handleObservabilityDrainPost(
  request: Request,
): Promise<Response> {
  const startedAt = Date.now();
  const route = "/api/internal/v1/observability/drain";
  const requestId = getRequestId(request);
  const context = {
    requestId,
    module: "observability",
    operation: "drain.ingest",
  };
  const { getVercelDrainSecret } = await import("@afenda/config/env");
  const signatureSecret = getVercelDrainSecret();

  if (!signatureSecret) {
    logServerEvent("error", "Drain secret is not configured.", context, {
      route,
      status: 503,
    });

    return Response.json(
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

    return Response.json(
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

  return Response.json({
    success: true,
    ...payloadSummary,
  });
}
