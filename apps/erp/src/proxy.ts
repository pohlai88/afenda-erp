import { hasNeonAuthSessionToken } from "@afenda/auth/neon-cookies";
import { isNeonAuthEnabled } from "@afenda/config/env";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_REFRESH_ONLY_PREFIXES = [
  "/sign-up",
  "/forgot-password",
] as const;

function shouldRefreshSessionOnly(pathname: string) {
  return SESSION_REFRESH_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

export async function proxy(request: NextRequest) {
  if (!isNeonAuthEnabled()) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  if (isApiRoute(pathname)) {
    return NextResponse.next();
  }

  if (
    shouldRefreshSessionOnly(pathname) &&
    !hasNeonAuthSessionToken(request.headers.get("cookie") ?? "")
  ) {
    return NextResponse.next();
  }

  const { getNeonAuthServer } = await import("@afenda/auth/neon-auth-server");
  return getNeonAuthServer().middleware({ loginUrl: "/sign-in" })(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
