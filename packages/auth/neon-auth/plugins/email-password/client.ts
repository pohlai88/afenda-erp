"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export function signInWithEmail(input: { email: string; password: string }) {
  return neonAuthClient.signIn.email(input);
}

export function signUpWithEmail(input: { email: string; password: string; name: string }) {
  return neonAuthClient.signUp.email(input);
}
