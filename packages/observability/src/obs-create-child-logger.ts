import type { LoggerContext, StructuralLogger } from "./obs-logger-types";
import { redactLogPayload } from "./obs-redact-policy";

export function createChildLogger(
  logger: StructuralLogger,
  context: LoggerContext,
): StructuralLogger {
  return logger.child(redactLogPayload(context));
}
