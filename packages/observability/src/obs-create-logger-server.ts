import "server-only";

import pino, { type Logger as PinoLogger } from "pino";
import { loggerServiceName } from "./obs-logger-constants";
import { resolveLogLevel } from "./obs-log-level";
import { safelyRedactLogPayload } from "./obs-redact-policy";
import { serializeError } from "./obs-serializers";
import { createLoggerTransport } from "./obs-transport";

let rootLogger: PinoLogger | undefined;

export function createLogger() {
  if (!rootLogger) {
    rootLogger = pino(
      {
        name: loggerServiceName,
        level: resolveLogLevel(),
        serializers: {
          error: serializeError,
          err: serializeError,
        },
        formatters: {
          level(label) {
            return { level: label };
          },
          bindings(bindings) {
            return safelyRedactLogPayload(bindings);
          },
          log(log) {
            return safelyRedactLogPayload(log);
          },
        },
      },
      createLoggerTransport(),
    );
  }

  return rootLogger;
}
