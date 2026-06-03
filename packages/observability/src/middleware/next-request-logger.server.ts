import "server-only";

import { randomUUID } from "node:crypto";
import { createChildLogger } from "../logger/create-child-logger";
import { createLogger } from "../logger/create-logger.server";
import type { LoggerContext, StructuralLogger } from "../logger/logger.types";
import { getRequestContext } from "../logger/request-context.server";

export function createNextRequestLogger(
  request: Request,
  context: LoggerContext = {},
): StructuralLogger {
  const activeContext = getRequestContext();
  const loggerContext = {
    ...activeContext,
    ...context,
  };
  const requestId =
    request.headers.get("x-vercel-id") ??
    request.headers.get("x-request-id") ??
    loggerContext.requestId ??
    randomUUID();

  return createChildLogger(createLogger(), {
    ...loggerContext,
    requestId,
    correlationId: loggerContext.correlationId ?? requestId,
    operationId: loggerContext.operationId ?? randomUUID(),
  });
}
