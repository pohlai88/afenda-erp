import type { Metadata } from "next";
import { connection } from "next/server";
import { NeonAuthUiLayout } from "@afenda/auth/neon-auth/ui";
import { Suspense, type ReactNode } from "react";

import { AuthRouteFallback } from "@/routes/auth-route-fallback";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense fallback={<AuthRouteFallback />}>
      <OnboardingLayoutInner>{children}</OnboardingLayoutInner>
    </Suspense>
  );
}

async function OnboardingLayoutInner({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await connection();
  return <NeonAuthUiLayout>{children}</NeonAuthUiLayout>;
}
