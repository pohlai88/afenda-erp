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

export default function AuthRouteGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense fallback={<AuthRouteFallback />}>
      <AuthRouteGroupLayoutInner>{children}</AuthRouteGroupLayoutInner>
    </Suspense>
  );
}

async function AuthRouteGroupLayoutInner({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await connection();
  return <NeonAuthUiLayout>{children}</NeonAuthUiLayout>;
}
