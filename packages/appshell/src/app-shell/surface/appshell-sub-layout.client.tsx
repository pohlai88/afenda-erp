"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@afenda/ui/utils";

import {
  APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY,
  type AppShellOperationalContextStackPatch,
} from "../operational-context-stack.shared";
import { AppShellOperationalContextRegistration } from "../operational-context-stack.client";
import {
  isAppShellPrimaryLeftRailNavItemActive,
  useAppShellRuntime,
} from "../appshell.client";
import type { AppShellPrimaryLeftRailConfig } from "../left-rail-bar/appshell-primary-left-rail.schema";

type AppSubLayoutFloatingContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  panelId: string;
};

const AppSubLayoutFloatingContext =
  createContext<AppSubLayoutFloatingContextValue | null>(null);

export function useAppShellSubLayoutFloating() {
  return useContext(AppSubLayoutFloatingContext);
}

export type AppSubLayoutProps = {
  rail?: AppShellPrimaryLeftRailConfig | null;
  contextPatch?: AppShellOperationalContextStackPatch | null;
  contextRegistrationId?: string;
  contextPriority?: number;
  children: ReactNode;
};

export function AppSubLayout({
  rail = null,
  contextPatch = null,
  contextRegistrationId,
  contextPriority = APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY.surface,
  children,
}: AppSubLayoutProps) {
  const runtime = useAppShellRuntime();
  const [floatingOpen, setFloatingOpen] = useState(false);

  const floatingContext = useMemo<AppSubLayoutFloatingContextValue>(
    () => ({
      open: floatingOpen,
      toggle: () => setFloatingOpen((current) => !current),
      close: () => setFloatingOpen(false),
      panelId: rail ? `af-appshell-sub-layout-${rail.storageKey}` : "af-appshell-sub-layout",
    }),
    [floatingOpen, rail],
  );

  const subRail =
    rail && runtime.railMode === "collapsed" ? (
      <aside
        aria-label={rail.labels.ariaLabel}
        className="hidden w-44 shrink-0 md:flex md:flex-col"
      >
        <SubLayoutRail rail={rail} />
      </aside>
    ) : null;

  return (
    <>
      {contextPatch ? (
        <AppShellOperationalContextRegistration
          id={contextRegistrationId ?? rail?.storageKey ?? "appshell-sub-layout"}
          patch={contextPatch}
          priority={contextPriority}
        />
      ) : null}
      <AppSubLayoutFloatingContext.Provider value={floatingContext}>
        <div className="flex min-h-0 min-w-0 flex-1 gap-6">
          {subRail}
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {rail && runtime.railMode !== "collapsed" ? (
              <FloatingSubLayoutRail rail={rail} />
            ) : null}
            {children}
          </div>
        </div>
      </AppSubLayoutFloatingContext.Provider>
    </>
  );
}

function FloatingSubLayoutRail({ rail }: { rail: AppShellPrimaryLeftRailConfig }) {
  const floating = useAppShellSubLayoutFloating();

  if (!floating) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute left-0 top-(--af-l1-height) z-20 w-52 rounded-r-card border border-border/70 bg-popover shadow-elevation-2 transition-transform",
        floating.open ? "translate-x-0" : "pointer-events-none -translate-x-full",
      )}
      id={floating.panelId}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <div className="text-sm font-medium">{rail.identity.primary}</div>
        <button
          aria-label="Close section navigation"
          className="af-appshell__icon-button af-appshell__icon-button--sm"
          onClick={floating.close}
          type="button"
        >
          <PanelLeft aria-hidden="true" size={14} />
        </button>
      </div>
      <SubLayoutRail rail={rail} />
    </div>
  );
}

function SubLayoutRail({ rail }: { rail: AppShellPrimaryLeftRailConfig }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-4 p-3" aria-label={rail.labels.ariaLabel}>
      {rail.sections.map((section) => (
        <section className="grid gap-1" key={section.id}>
          {section.label ? (
            <div className="text-[11px] font-medium uppercase text-muted-foreground">
              {section.label}
            </div>
          ) : null}
          {section.items.map((item) => {
            const active = isAppShellPrimaryLeftRailNavItemActive(item, pathname);
            return (
              <Link
                className={cn(
                  "rounded-card px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
                href={item.href}
                key={item.id}
              >
                {item.label}
              </Link>
            );
          })}
        </section>
      ))}
    </nav>
  );
}
