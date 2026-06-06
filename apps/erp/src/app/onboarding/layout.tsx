import type { Metadata } from "next";
import { connection } from "next/server";
import { NeonAuthUiLayout } from "@afenda/auth/neon-auth/ui";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Suspense, type ReactNode } from "react";

import { AuthRouteFallback } from "@/routes/auth-route-fallback";

const fraunces = Fraunces({
  variable: "--font-onboarding-display",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-onboarding-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

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

  return (
    <div className={`${fraunces.variable} ${ibmPlexMono.variable}`}>
      <NeonAuthUiLayout>{children}</NeonAuthUiLayout>
    </div>
  );
}
