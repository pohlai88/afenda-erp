import type { Metadata } from "next";

import { NeonAuthSignOutPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Sign out",
  robots: { index: false, follow: false },
};

export default async function SignOutPage() {
  return NeonAuthSignOutPage();
}
