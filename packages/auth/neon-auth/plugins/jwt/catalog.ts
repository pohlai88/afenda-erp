/** @see https://neon.com/docs/auth/guides/plugins/jwt */
export const implementedNeonJwtServerPatterns = ["verifyNeonAuthAccessToken.jose.jwks.EdDSA"] as const;
export const deferredNeonJwtClientMethods = ["token"] as const;
