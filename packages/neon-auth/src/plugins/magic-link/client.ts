"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export function signInWithMagicLink(input: { email: string; callbackURL: string }) {
  return neonAuthClient.signIn.magicLink(input);
}
