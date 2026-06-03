import type { Metadata } from "next";

import { requireNeonGuestSession } from "@afenda/auth/neon-auth/server";
import { NeonAuthVerifyEmailPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage() {
  await requireNeonGuestSession();
  return NeonAuthVerifyEmailPage();
}
