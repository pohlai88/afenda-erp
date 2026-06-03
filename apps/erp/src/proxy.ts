import {
  erpPreLoginAuthPathPrefixes,
  NEON_AUTH_SESSION_TOKEN_COOKIE,
} from "@afenda/auth/neon-auth/server";
import { isDevCookieAuthEnabled, isNeonAuthEnabled } from "@afenda/config/env";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AFENDA_SESSION_COOKIE = "afenda-dev-session";

function isPreLoginAuthPath(pathname: string) {
  return erpPreLoginAuthPathPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

type NeonAuthProxyHandler = (
  request: NextRequest,
) => Promise<NextResponse> | NextResponse;

let neonAuthMiddleware: NeonAuthProxyHandler | undefined;

export async function proxy(request: NextRequest) {
  if (!isNeonAuthEnabled()) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (isDevCookieAuthEnabled() && request.cookies.has(AFENDA_SESSION_COOKIE)) {
    return NextResponse.next();
  }

  if (
    isPreLoginAuthPath(pathname) &&
    !request.cookies.has(NEON_AUTH_SESSION_TOKEN_COOKIE)
  ) {
    return NextResponse.next();
  }

  neonAuthMiddleware ??= (
    await import("@afenda/auth/neon-auth/server")
  ).getNeonAuthServer().middleware({ loginUrl: "/sign-in" });

  return neonAuthMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Skip API routes, static assets, and metadata files so proxy only runs on
     * navigations that may need Neon session refresh.
     * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
