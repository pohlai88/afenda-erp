"use client";

import type { ReactNode } from "react";

export function AppShellNotificationsAdvancedBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <div className="text-sm font-medium">{title}</div>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}
