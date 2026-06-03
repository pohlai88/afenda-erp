import type { Metadata } from "next";

import { requireNeonGuestSession } from "@afenda/auth/neon-auth/server";
import { NeonAuthMagicLinkPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Magic link",
  robots: { index: false, follow: false },
};

export default async function MagicLinkPage() {
  await requireNeonGuestSession();
  return NeonAuthMagicLinkPage();
}
