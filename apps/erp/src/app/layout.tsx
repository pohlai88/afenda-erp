import { appRootMetadataCopy } from "@afenda/kernel";
import { AfendaThemeProvider } from "@afenda/ui";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppAnalytics } from "./app-analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: appRootMetadataCopy.defaultTitle,
    template: appRootMetadataCopy.titleTemplate,
  },
  description: appRootMetadataCopy.description,
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
      <body className="min-h-full font-sans antialiased">
        <AfendaThemeProvider>{children}</AfendaThemeProvider>
        <AppAnalytics />
      </body>
    </html>
  );
}
