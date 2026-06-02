import "server-only";

import type { Logger as PinoLogger } from "pino";
import { createChildLogger } from "../logger/create-child-logger";
import { createLogger } from "../logger/create-logger.server";
import type { LoggerContext } from "../logger/logger.types";

export function createNextRequestLogger(
  request: Request,
  context: LoggerContext = {},
): PinoLogger {
  const requestId =
    request.headers.get("x-vercel-id") ??
    request.headers.get("x-request-id") ??
    context.requestId;

  return createChildLogger(createLogger(), {
    ...context,
    requestId,
    correlationId: context.correlationId ?? requestId,
  });
}
