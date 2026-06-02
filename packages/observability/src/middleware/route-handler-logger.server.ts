import "server-only";

import type { Logger as PinoLogger } from "pino";
import { createNextRequestLogger } from "./next-request-logger.server";
import type { LoggerContext } from "../logger/logger.types";
import { serializeError } from "../logger/serializers";

export async function withRouteHandlerLogger<T>(
  request: Request,
  context: LoggerContext & { route: string; event: string },
  handler: (logger: PinoLogger) => Promise<T>,
) {
  const startedAt = Date.now();
  const logger = createNextRequestLogger(request, context);

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
}
