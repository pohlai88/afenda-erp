import type { Route } from "next";

const safeRoutePattern =
  /^\/(?!\/)[A-Za-z0-9/_:.-]*(?:\?[A-Za-z0-9%=&_:.+-]*)?(?:#[A-Za-z0-9_-]*)?$/;

export function isGovernedRoute(href: string): href is Route {
  return safeRoutePattern.test(href);
}

export function asGovernedRoute(href: string): Route {
  if (!isGovernedRoute(href)) {
    throw new Error(`[governed-route] Unsafe route: ${href}`);
  }

  return href;
}
