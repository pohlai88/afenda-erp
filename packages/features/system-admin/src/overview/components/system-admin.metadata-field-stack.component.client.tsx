"use client";

import type { ReactNode } from "react";

export function SystemAdminMetadataFieldStack({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <section className="flex flex-col gap-surface-sm">
      <h3 className="type-label">{label}</h3>
      <div className={mono ? "type-mono-cell text-muted-foreground" : "type-body"}>
        {children}
      </div>
    </section>
  );
}
