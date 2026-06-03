/** @see https://neon.com/docs/auth/guides/plugins/jwt */
export const implementedNeonSessionPatterns = ["getNeonAuthServer.getSession"] as const;

export const implementedNeonJwtServerPatterns = [
  "verifyNeonAuthAccessToken.jose.jwks.EdDSA",
] as const;

export const deferredNeonJwtClientMethods = [
  "token",
  "getSession.responseHeader.set-auth-jwt",
] as const;

export const deferredNeonJwtServerPatterns = ["api.routes.BearerAuthorization"] as const;

export type ImplementedNeonSessionPattern = (typeof implementedNeonSessionPatterns)[number];

export type ImplementedNeonJwtServerPattern = (typeof implementedNeonJwtServerPatterns)[number];

export type DeferredNeonJwtClientMethod = (typeof deferredNeonJwtClientMethods)[number];

export type DeferredNeonJwtServerPattern = (typeof deferredNeonJwtServerPatterns)[number];
