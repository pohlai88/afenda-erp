import "server-only";

import pino, { type Logger as PinoLogger } from "pino";
import { loggerServiceName } from "./logger.constants";
import { resolveLogLevel } from "./log-level";
import { redactLogPayload } from "./redact-policy";
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
          bindings(bindings) {
            return redactLogPayload(bindings);
          },
          log(log) {
            return redactLogPayload(log);
          },
        },
      },
      createLoggerTransport(),
    );
  }

  return rootLogger;
}
