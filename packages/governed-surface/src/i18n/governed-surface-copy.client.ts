"use client";

export function useLocale() {
  return "en";
}

export function useTranslations(_namespace?: string) {
  return (key: string) => key;
}
