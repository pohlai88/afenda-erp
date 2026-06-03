"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@afenda/ui";

export function AppShellContextMenu({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div className="contents">{children}</div>}>
      <AppShellContextMenuInner>{children}</AppShellContextMenuInner>
    </Suspense>
  );
}

function AppShellContextMenuInner({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function copyPath() {
    await navigator.clipboard.writeText(pathname);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="contents">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Workspace actions</ContextMenuLabel>
        <ContextMenuItem onClick={() => void copyPath()}>Copy current path</ContextMenuItem>
        <ContextMenuItem onClick={() => router.push("/dashboard")}>Go to dashboard</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
