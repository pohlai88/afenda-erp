"use client";

import type { ReactNode } from "react";

export function Conversation({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-[520px] space-y-4 overflow-y-auto px-4 py-4">
      {children}
    </div>
  );
}
