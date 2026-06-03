import type { Metadata } from "next";

import { requireNeonGuestSession } from "@afenda/auth/neon-auth/server";
import { NeonAuthOtpPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Email code",
};

export default async function OtpPage() {
  await requireNeonGuestSession();
  return NeonAuthOtpPage();
}
