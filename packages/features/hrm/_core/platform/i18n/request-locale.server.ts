import "server-only"

import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from "./locales.shared"

/**
 * Resolves the current request locale from Next.js headers or the URL prefix.
 * Falls back to the default locale.
 */
export async function getRequestLocale(): Promise<SupportedLocale> {
  try {
    const { headers } = await import("next/headers")
    const headerStore = await headers()
    const raw =
      headerStore.get("x-afenda-locale") ??
      headerStore.get("accept-language")?.split(",")[0]?.split("-")[0] ??
      DEFAULT_LOCALE
    return isSupportedLocale(raw) ? raw : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}
