/**
 * Supported locale identifiers for the Afenda ERP application.
 */

export const SUPPORTED_LOCALES = ["en", "ms", "zh"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = "en"

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}
