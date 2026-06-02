import "server-only";

import { createChildLogger } from "./create-child-logger";
import { createLogger } from "./create-logger.server";
import type { LoggerContext } from "./logger.types";

export function createPackageLogger(
  packageName: string,
  context: LoggerContext = {},
) {
  return createChildLogger(createLogger(), {
    ...context,
    package: packageName,
  });
}
