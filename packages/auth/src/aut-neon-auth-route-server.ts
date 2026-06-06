import "server-only";

import { getNeonAuthServer, isNeonAuthReady } from "./aut-neon-auth-server";

type AuthMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type AuthRouteContext = { params: Promise<{ path: string[] }> };

async function resolveHandler(method: AuthMethod) {
  if (!isNeonAuthReady()) {
    return new Response("Neon Auth is not configured.", { status: 503 });
  }

  const handlers = getNeonAuthServer().handler();
  return handlers[method];
}

async function handleAuthRequest(
  method: AuthMethod,
  request: Request,
  context: AuthRouteContext,
) {
  try {
    const handler = await resolveHandler(method);
    return handler instanceof Response ? handler : await handler(request, context);
  } catch {
    return new Response("Auth route failed.", { status: 500 });
  }
}

function createAuthMethodHandler(method: AuthMethod) {
  return (request: Request, context: AuthRouteContext) =>
    handleAuthRequest(method, request, context);
}

export function getNeonAuthRouteHandlers() {
  return {
    GET: createAuthMethodHandler("GET"),
    POST: createAuthMethodHandler("POST"),
    PUT: createAuthMethodHandler("PUT"),
    PATCH: createAuthMethodHandler("PATCH"),
    DELETE: createAuthMethodHandler("DELETE"),
  };
}
