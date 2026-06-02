import "server-only";

import { createChildLogger } from "./create-child-logger";
import { createLogger } from "./create-logger.server";
import type { LoggerContext } from "./logger.types";

export function createDomainLogger(domain: string, context: LoggerContext = {}) {
  return createChildLogger(createLogger(), {
    ...context,
    domain,
  });
}
