import "server-only";

import { randomUUID } from "node:crypto";
import { createDomainLogger } from "./obs-create-domain-logger";
import type { LoggerContext, StructuralLogger } from "./obs-logger-types";
import { withRequestContext } from "./obs-request-context-server";
import { serializeError } from "./obs-serializers";

export async function withServerActionLogger<T>(
  context: LoggerContext & { domain: string; event: string },
  action: (logger: StructuralLogger) => Promise<T>,
) {
  const startedAt = Date.now();
  const actionContext = {
    ...context,
    operationId: context.operationId ?? randomUUID(),
  };
  const logger = createDomainLogger(context.domain, actionContext);

  return withRequestContext(actionContext, async () => {
    logger.info({ event: `${context.event}.started` }, "Server action started");

    try {
      const result = await action(logger);
      logger.info(
        {
          event: `${context.event}.completed`,
          durationMs: Date.now() - startedAt,
          outcome: "success",
        },
        "Server action completed",
      );
      return result;
    } catch (error) {
      logger.error(
        {
          event: `${context.event}.failed`,
          durationMs: Date.now() - startedAt,
          outcome: "failure",
          error: serializeError(error),
        },
        "Server action failed",
      );
      throw error;
    }
  });
}
