import type { Metadata } from "next";

import { requireNeonGuestSession } from "@afenda/auth/neon-auth/server";
import { NeonAuthForgotPasswordPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default async function ForgotPasswordPage() {
  await requireNeonGuestSession();
  return NeonAuthForgotPasswordPage();
}
