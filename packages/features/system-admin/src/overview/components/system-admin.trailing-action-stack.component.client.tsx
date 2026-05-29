"use client";

import type { ReactNode } from "react";

export function SystemAdminTrailingActionStack({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-surface-sm">
      <div className="flex flex-wrap items-center gap-surface-sm">{children}</div>
      {footer}
    </div>
  );
}
