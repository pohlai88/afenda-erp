/** Flow catalog: @afenda/auth/auth-flows — ARCH-1004 exception; not internal/v1. */
import {
  getNeonAuthServer,
  isNeonAuthReady,
} from "@afenda/neon-auth/server";
import { authApiRouteCopy } from "@afenda/kernel";
import { getRequestId, logServerEvent } from "@afenda/observability/server";

type AuthMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type AuthRouteContext = { params: Promise<{ path: string[] }> };

async function resolveHandler(method: AuthMethod) {
  if (!isNeonAuthReady()) {
    return new Response(authApiRouteCopy.neonNotConfigured, { status: 503 });
  }

  const handlers = getNeonAuthServer().handler();
  return handlers[method];
}

async function handleAuthRequest(
  method: AuthMethod,
  request: Request,
  context: AuthRouteContext,
) {
  const startedAt = Date.now();
  const route = "/api/auth/[...path]";
  const logContext = {
    requestId: getRequestId(request),
    module: "auth",
    operation: `neon_auth.${method.toLowerCase()}`,
  };

  try {
    logServerEvent("info", "Auth route started.", logContext, { route });

    const handler = await resolveHandler(method);
    const response =
      handler instanceof Response ? handler : await handler(request, context);

    logServerEvent("info", "Auth route completed.", logContext, {
      route,
      durationMs: Date.now() - startedAt,
      status: response.status,
    });

    return response;
  } catch (error) {
    logServerEvent("error", "Auth route failed.", logContext, {
      route,
      durationMs: Date.now() - startedAt,
      status: 500,
      error: error instanceof Error ? error.message : String(error),
    });

    return new Response(authApiRouteCopy.routeFailed, { status: 500 });
  }
}

export async function GET(request: Request, context: AuthRouteContext) {
  return handleAuthRequest("GET", request, context);
}

export async function POST(request: Request, context: AuthRouteContext) {
  return handleAuthRequest("POST", request, context);
}

export async function PUT(request: Request, context: AuthRouteContext) {
  return handleAuthRequest("PUT", request, context);
}

export async function PATCH(request: Request, context: AuthRouteContext) {
  return handleAuthRequest("PATCH", request, context);
}

export async function DELETE(request: Request, context: AuthRouteContext) {
  return handleAuthRequest("DELETE", request, context);
}
