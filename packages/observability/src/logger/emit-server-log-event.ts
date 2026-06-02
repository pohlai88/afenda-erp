import { redactLogPayload } from "./redact-policy";
import type {
  ServerLogContext,
  ServerLogEvent,
  ServerLogLevel,
  ServerLogMetadata,
} from "./logger.types";

export function emitServerLogEvent(
  level: ServerLogLevel,
  message: string,
  context: ServerLogContext,
  metadata: ServerLogMetadata = {},
) {
  try {
    const event = redactLogPayload({
      level,
      message,
      ...context,
      ...metadata,
      timestamp: new Date().toISOString(),
    } satisfies ServerLogEvent & Record<string, unknown>);

    const line = JSON.stringify(event);

    if (level === "error") {
      console.error(line);
      return;
    }

    if (level === "warn") {
      console.warn(line);
      return;
    }

    console.log(line);
  } catch {
    // Logging is diagnostic only; business execution must continue.
  }
}
