"use client";

import { neonAuthClient } from "../../runtime/neon-auth.client";

export function updateNeonUserProfile(input: { name?: string; image?: string | null }) {
  return neonAuthClient.updateUser(input);
}

export function changeNeonPassword(input: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}) {
  return neonAuthClient.changePassword(input);
}

export function sendNeonVerificationEmail(input?: { email?: string; callbackURL?: string }) {
  const client = neonAuthClient as {
    sendVerificationEmail?: (payload: { email?: string; callbackURL?: string }) => Promise<unknown>;
  };
  if (typeof client.sendVerificationEmail !== "function") {
    throw new Error("sendVerificationEmail is not available on the Neon Auth client.");
  }
  return client.sendVerificationEmail(input ?? {});
}

export function getNeonClientSession() {
  return neonAuthClient.getSession();
}

export function signOutNeonClient() {
  return neonAuthClient.signOut();
}
