"use client";

import type { ReactNode } from "react";

import {
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@afenda/ui";

export function AppShellUtilityPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PopoverHeader>
        <PopoverTitle>{title}</PopoverTitle>
        {description ? (
          <PopoverDescription>{description}</PopoverDescription>
        ) : null}
      </PopoverHeader>
      <div className="flex flex-col gap-3">{children}</div>
    </>
  );
}
