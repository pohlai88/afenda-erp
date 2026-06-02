import "server-only";

import pino, { type TransportSingleOptions } from "pino";

export function createLoggerTransport() {
  if (process.env.NODE_ENV !== "development") {
    return undefined;
  }

  return pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
    },
  } satisfies TransportSingleOptions);
}
