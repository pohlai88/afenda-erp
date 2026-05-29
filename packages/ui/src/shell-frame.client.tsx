"use client";

import type { CSSProperties, ReactNode } from "react";

import { uiLayout, uiOverlay, uiZIndex } from "./design-system";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "./sidebar";
import { cn } from "./utils";

const shellSidebarWidth = "var(--spacing-shell-sidebar, 19rem)";

type ShellFrameProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export function ShellFrame({ sidebar, header, children }: ShellFrameProps) {
  return (
    <SidebarProvider
      defaultOpen
      className="min-h-svh bg-background"
      style={
        {
          "--sidebar-width": shellSidebarWidth,
        } as CSSProperties
      }
    >
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarContent className="gap-surface-lg p-surface-lg">
          {sidebar}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-h-svh bg-background">
        <header
          className={cn(
            "sticky top-0 shrink-0 border-b border-border",
            uiZIndex.commandbar,
            uiOverlay.panel,
            "shadow-elevation-1",
            "px-surface-lg py-surface-md sm:px-surface-2xl lg:px-surface-3xl",
          )}
        >
          <div className="flex min-h-commandbar items-center gap-surface-md">
            <SidebarTrigger className="shrink-0 md:hidden" />
            <div className="min-w-0 flex-1">{header}</div>
          </div>
        </header>
        <div className={cn("flex flex-1 flex-col py-surface-2xl", uiLayout.pageShell)}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
