/** @see https://neon.com/docs/auth/guides/user-management */
export const implementedNeonAccountClientMethods = [
  "updateUser",
  "changePassword",
  "getSession",
  "signOut",
] as const;

export const deferredNeonAccountClientMethods = ["deleteUser", "changeEmail"] as const;
