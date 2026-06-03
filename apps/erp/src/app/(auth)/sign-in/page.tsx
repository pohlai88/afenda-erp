import type { Metadata } from "next";

import { requireNeonGuestSession } from "@afenda/auth/neon-auth/server";
import { NeonAuthSignInPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  await requireNeonGuestSession();
  return NeonAuthSignInPage();
}
