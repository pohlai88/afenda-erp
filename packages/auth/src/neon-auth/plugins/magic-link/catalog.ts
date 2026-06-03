/** @see https://neon.com/docs/auth/guides/plugins/magic-link */
export const implementedNeonMagicLinkClientMethods = ["signIn.magicLink"] as const;
export const deferredNeonMagicLinkClientMethods = ["magicLink.verify"] as const;
