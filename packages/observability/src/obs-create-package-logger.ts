import "server-only";

import { createChildLogger } from "./obs-create-child-logger";
import { createLogger } from "./obs-create-logger-server";
import type { LoggerContext, StructuralLogger } from "./obs-logger-types";
import { getRequestContext } from "./obs-request-context-server";

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
