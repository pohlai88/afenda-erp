import type { Metadata } from "next";

import { NeonAuthCallbackPage } from "@afenda/auth/neon-auth/pages";

export const metadata: Metadata = {
  title: "Signing in",
  robots: { index: false, follow: false },
};

export default async function CallbackPage() {
  return NeonAuthCallbackPage();
}
