import type { ReactNode } from "react";

import { AppShell } from "@afenda/appshell/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createMetadataUiPlaygroundChrome } from "./_fixtures/chrome.server";

export const metadata: Metadata = {
  title: "Metadata UI Playground",
  description: "Developer-only metadata UI playground.",
  robots: {
    index: false,
    follow: false,
  },
};

function assertMetadataUiPlaygroundEnabled() {
  if (process.env.AFENDA_ENABLE_DEV_PLAYGROUNDS !== "1") {
    notFound();
  }
}

export default function MetadataUiPlaygroundLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  assertMetadataUiPlaygroundEnabled();

  return (
    <AppShell chrome={createMetadataUiPlaygroundChrome()}>
      {children}
    </AppShell>
  );
}
