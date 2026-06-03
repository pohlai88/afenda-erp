import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const unstable_instant = false;

export default async function AuthRouteGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await connection();
  return children;
}
