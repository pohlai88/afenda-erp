import "server-only";

import { redirect } from "next/navigation";
import { getPostSignInDestination, getSession } from "@afenda/auth/server";

export async function requireGuestSession() {
  const session = await getSession();

  if (session) {
    redirect(getPostSignInDestination(session));
  }
}
