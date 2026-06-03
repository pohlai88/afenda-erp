"use client";

import { Button } from "@afenda/ui";
import type { ReactNode } from "react";

export function RouteStateRetryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button onClick={onClick} type="button">
      {children}
    </Button>
  );
}
