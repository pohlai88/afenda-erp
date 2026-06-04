import "server-only";

import { redirect } from "next/navigation";

import { erpPreLoginPostAuthPath } from "./aut-paths-shared";
import {
  readNeonAuthSessionPayload,
  type NeonAuthSessionPayload,
} from "./aut-neon-session-server";

export { erpPreLoginPostAuthPath };

/** Neon-only guest gate (no tenant hydration). Post-auth lands on account until phase C. */
export async function requireNeonGuestSession(
  postAuthPath = erpPreLoginPostAuthPath,
) {
  const payload = await readNeonAuthSessionPayload();
  if (payload?.session && payload?.user) {
    redirect(postAuthPath);
  }
}

/** Requires a Neon Auth session without tenant/org hydration (pre-login account, etc.). */
export async function requireNeonAuthSession(
  signInPath = "/sign-in",
): Promise<NeonAuthSessionPayload> {
  const payload = await readNeonAuthSessionPayload();
  if (!payload?.session || !payload?.user) {
    redirect(signInPath);
  }
  return payload;
}
