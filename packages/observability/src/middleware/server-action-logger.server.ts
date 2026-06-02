import "server-only";

import type { Logger as PinoLogger } from "pino";
import { createDomainLogger } from "../logger/create-domain-logger";
import type { LoggerContext } from "../logger/logger.types";
import { serializeError } from "../logger/serializers";

export async function withServerActionLogger<T>(
  context: LoggerContext & { domain: string; event: string },
  action: (logger: PinoLogger) => Promise<T>,
) {
  const startedAt = Date.now();
  const logger = createDomainLogger(context.domain, context);

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
}
