"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

import { TooltipProvider } from "./tooltip";

export function AfendaThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </NextThemesProvider>
  );
}
