/** @see https://neon.com/docs/auth/reference/nextjs-server#authupdateuser */
export const implementedNeonAccountClientMethods = [
  "updateUser",
  "changePassword",
  "sendVerificationEmail",
  "deleteUser",
] as const;

export const implementedNeonAccountServerMethods = [
  "updateUser",
  "changePassword",
  "sendVerificationEmail",
  "deleteUser",
] as const;
