import type { LoggerContext, StructuralLogger } from "./logger.types";
import { redactLogPayload } from "./redact-policy";

export function createChildLogger(
  logger: StructuralLogger,
  context: LoggerContext,
): StructuralLogger {
  return logger.child(redactLogPayload(context));
}
