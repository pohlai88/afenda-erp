import "server-only";

import { createChildLogger } from "./create-child-logger";
import { createLogger } from "./create-logger.server";
import type { LoggerContext, StructuralLogger } from "./logger.types";
import { getRequestContext } from "./request-context.server";

export function createPackageLogger(
  packageName: string,
  context: LoggerContext = {},
): StructuralLogger {
  const requestContext = getRequestContext();

  return createChildLogger(createLogger(), {
    ...requestContext,
    ...context,
    package: packageName,
  });
}
