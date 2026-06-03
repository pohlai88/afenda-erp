import { AFENDA_SESSION_COOKIE } from "@afenda/auth";
import { hasNeonAuthSessionToken } from "@afenda/neon-auth/neon-cookies";
import { isDevCookieAuthEnabled, isNeonAuthEnabled } from "@afenda/config/env";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_REFRESH_ONLY_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
] as const;

function shouldRefreshSessionOnly(pathname: string) {
  return SESSION_REFRESH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

function isPublicLandingRoute(pathname: string) {
  return pathname === "/";
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

function hasDevSessionCookie(request: NextRequest) {
  return request.cookies.has(AFENDA_SESSION_COOKIE);
}

export async function proxy(request: NextRequest) {
  if (!isNeonAuthEnabled()) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  if (isApiRoute(pathname)) {
    return NextResponse.next();
  }

  if (isPublicLandingRoute(pathname)) {
    return NextResponse.next();
  }

  if (isDevCookieAuthEnabled() && hasDevSessionCookie(request)) {
    return NextResponse.next();
  }

  if (
    shouldRefreshSessionOnly(pathname) &&
    !hasNeonAuthSessionToken(request.headers.get("cookie") ?? "")
  ) {
    return NextResponse.next();
  }

  const { getNeonAuthServer } = await import("@afenda/neon-auth/server");
  return getNeonAuthServer().middleware({ loginUrl: "/sign-in" })(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
