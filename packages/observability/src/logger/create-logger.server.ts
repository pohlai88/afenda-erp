import "server-only";

import pino, { type Logger as PinoLogger } from "pino";
import { loggerServiceName } from "./logger.constants";
import { resolveLogLevel } from "./log-level";
import { safelyRedactLogPayload } from "./redact-policy";
import { serializeError } from "./serializers";
import { createLoggerTransport } from "./transport";

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
