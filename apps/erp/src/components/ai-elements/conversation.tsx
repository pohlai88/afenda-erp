"use client";

import type { ReactNode } from "react";

export function Conversation({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex max-h-[520px] flex-col gap-surface-lg overflow-y-auto px-surface-lg py-surface-lg" // audit-ds: ignore no-arbitrary-value — Lynx conversation scroll viewport height
    >
      {children}
    </div>
  );
}
