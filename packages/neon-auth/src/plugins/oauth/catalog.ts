/** @see https://neon.com/docs/auth/guides/setup-oauth */
export const supportedNeonOAuthProviders = ["google", "github", "vercel"] as const;
export type SupportedNeonOAuthProvider = (typeof supportedNeonOAuthProviders)[number];
