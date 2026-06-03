import type { Metadata } from "next";
import { connection } from "next/server";
import { NeonAuthUiLayout } from "@afenda/auth/neon-auth/ui";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await connection();
  return <NeonAuthUiLayout>{children}</NeonAuthUiLayout>;
}
