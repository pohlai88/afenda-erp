import type { Metadata } from "next";

import { NeonAuthAccountSecurityPage } from "@afenda/auth/neon-auth/pages";
import { requireNeonAuthSession } from "@afenda/auth/neon-auth/server";

export const metadata: Metadata = {
  title: "Account security",
  robots: { index: false, follow: false },
};

export default async function AccountSecurityPage() {
  await requireNeonAuthSession();
  return NeonAuthAccountSecurityPage();
}
