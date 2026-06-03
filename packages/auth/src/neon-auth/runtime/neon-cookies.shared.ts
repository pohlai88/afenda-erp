export const NEON_AUTH_SESSION_TOKEN_COOKIE = "__Secure-neon-auth.session_token";

function parseCookieHeader(cookieHeader: string): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const segment of cookieHeader.split(";")) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    cookies.set(trimmed.slice(0, separator), trimmed.slice(separator + 1));
  }
  return cookies;
}

export function hasNeonAuthSessionToken(cookieHeader: string) {
  return parseCookieHeader(cookieHeader).has(NEON_AUTH_SESSION_TOKEN_COOKIE);
}
