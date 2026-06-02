import type { Logger as PinoLogger } from "pino";
import type { LoggerContext } from "./logger.types";
import { redactLogPayload } from "./redact-policy";

export function createChildLogger(
  logger: PinoLogger,
  context: LoggerContext,
) {
  return logger.child(redactLogPayload(context));
}
