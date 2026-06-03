import "server-only";

import { randomUUID } from "node:crypto";
import { createNextRequestLogger } from "./next-request-logger.server";
import type { LoggerContext, StructuralLogger } from "../logger/logger.types";
import { withRequestContext } from "../logger/request-context.server";
import { serializeError } from "../logger/serializers";

export async function withRouteHandlerLogger<T>(
  request: Request,
  context: LoggerContext & { route: string; event: string },
  handler: (logger: StructuralLogger) => Promise<T>,
) {
  const startedAt = Date.now();
  const requestId =
    request.headers.get("x-vercel-id") ??
    request.headers.get("x-request-id") ??
    context.requestId ??
    randomUUID();
  const requestContext = {
    ...context,
    requestId,
    correlationId: context.correlationId ?? requestId,
    operationId: context.operationId ?? randomUUID(),
  };
  const logger = createNextRequestLogger(request, requestContext);

  return withRequestContext(requestContext, async () => {
    logger.info({ event: `${context.event}.started`, route: context.route });

    try {
      const result = await handler(logger);
      logger.info(
        {
          event: `${context.event}.completed`,
          route: context.route,
          durationMs: Date.now() - startedAt,
          outcome: "success",
        },
        "Route handler completed",
      );
      return result;
    } catch (error) {
      logger.error(
        {
          event: `${context.event}.failed`,
          route: context.route,
          durationMs: Date.now() - startedAt,
          outcome: "failure",
          error: serializeError(error),
        },
        "Route handler failed",
      );
      throw error;
    }
  });
}
