import "server-only";

import { randomUUID } from "node:crypto";
import { createChildLogger } from "./obs-create-child-logger";
import { createLogger } from "./obs-create-logger-server";
import type { LoggerContext, StructuralLogger } from "./obs-logger-types";
import { getRequestContext } from "./obs-request-context-server";

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
