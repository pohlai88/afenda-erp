import type { Metadata } from "next";

import { requireNeonGuestSession } from "@afenda/auth/neon-auth/server";
import { NeonAuthSignUpPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignUpPage() {
  await requireNeonGuestSession();
  return NeonAuthSignUpPage();
}
