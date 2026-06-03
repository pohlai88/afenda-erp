"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";
import type { SupportedNeonOAuthProvider } from "./catalog";

export function signInWithOAuth(input: {
  provider: SupportedNeonOAuthProvider;
  callbackURL?: string;
}) {
  return neonAuthClient.signIn.social(input);
}
