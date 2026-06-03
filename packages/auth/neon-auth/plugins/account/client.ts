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

export function getNeonClientSession() {
  return neonAuthClient.getSession();
}

export function signOutNeonClient() {
  return neonAuthClient.signOut();
}
