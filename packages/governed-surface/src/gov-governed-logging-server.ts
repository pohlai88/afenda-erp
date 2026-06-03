import "server-only";

import { logServerEvent } from "@afenda/observability/server";

const GOVERNED_SURFACE_MODULE = "governed-surface";

export function logUnexpectedServerError(
  message: string,
  error: unknown,
  metadata: Record<string, unknown> = {},
) {
  logServerEvent(
    "error",
    message,
    {
      module: GOVERNED_SURFACE_MODULE,
      operation: "unexpected_server_error",
    },
    {
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
      ...metadata,
    },
  );
}

export function logGovernedListSurfaceRenderDiagnostic(
  metadata: Record<string, unknown>,
  message: string,
) {
  logServerEvent(
    "info",
    message,
    {
      module: GOVERNED_SURFACE_MODULE,
      operation: "list_surface_render",
    },
    metadata,
  );
}
