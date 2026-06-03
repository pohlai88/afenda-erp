import type { Metadata } from "next";

import { requireNeonGuestSession } from "@afenda/auth/neon-auth/server";
import { NeonAuthResetPasswordPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  await requireNeonGuestSession();
  return NeonAuthResetPasswordPage();
}
