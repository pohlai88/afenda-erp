import { AfendaThemeProvider } from "@afenda/ui";
import { appRootMetadataCopy } from "@afenda/kernel";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

function resolveMetadataBase(): URL | undefined {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) {
    return undefined;
  }

  try {
    return new URL(siteUrl);
  } catch {
    return undefined;
  }
}

const metadataBase = resolveMetadataBase();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: appRootMetadataCopy.defaultTitle,
    template: appRootMetadataCopy.titleTemplate,
  },
  description: appRootMetadataCopy.description,
  applicationName: appRootMetadataCopy.defaultTitle,
  referrer: "origin-when-cross-origin",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    siteName: appRootMetadataCopy.defaultTitle,
    title: appRootMetadataCopy.defaultTitle,
    description: appRootMetadataCopy.description,
    ...(metadataBase ? { url: metadataBase } : {}),
  },
  twitter: {
    card: "summary",
    title: appRootMetadataCopy.defaultTitle,
    description: appRootMetadataCopy.description,
  },
  other: {
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#131922" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <AfendaThemeProvider>{children}</AfendaThemeProvider>
      </body>
    </html>
  );
}
