/** @see https://neon.com/docs/auth/reference/nextjs-server — email + password auth methods */
export const implementedNeonEmailPasswordClientMethods = [
  "signIn.email",
  "signUp.email",
] as const;

export const implementedNeonEmailPasswordServerMethods = [
  "signIn.email",
  "signUp.email",
] as const;
