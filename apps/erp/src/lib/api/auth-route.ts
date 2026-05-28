import { authApiRouteCopy } from "@afenda/kernel";

export function getNeonAuthNotConfiguredResponse() {
  return new Response(authApiRouteCopy.neonNotConfigured, {
    status: 503,
  });
}

export function getAuthRouteFailedResponse() {
  return new Response(authApiRouteCopy.routeFailed, {
    status: 500,
  });
}
