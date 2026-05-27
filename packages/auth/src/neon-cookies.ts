export const NEON_AUTH_SESSION_DATA_COOKIE =
  "__Secure-neon-auth.local.session_data";
export const NEON_AUTH_SESSION_TOKEN_COOKIE = "__Secure-neon-auth.session_token";

export function hasNeonAuthSessionToken(cookieHeader: string) {
  return cookieHeader.includes(NEON_AUTH_SESSION_TOKEN_COOKIE);
}
