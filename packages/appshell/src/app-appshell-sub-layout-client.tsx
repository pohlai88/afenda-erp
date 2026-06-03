"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PanelLeft } from "lucide-react";

import { Button } from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

import {
  APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY,
  type AppShellOperationalContextStackPatch,
} from "./app-operational-context-stack-shared";
import { AppShellOperationalContextRegistration } from "./app-operational-context-stack-client";
import { useAppShellRuntime } from "./app-client";
import type { AppShellPrimaryLeftRailConfig } from "./app-appshell-primary-left-rail-schema";
import { appShellSubLayoutFloatingPanelId } from "./app-appshell-sub-layout-floating-panel-id-shared";
import { AppShellSubLayoutLeftRail } from "./app-appshell-sub-layout-left-rail-client";

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
      panelId: appShellSubLayoutFloatingPanelId(rail?.storageKey),
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
        <Button
          aria-label="Close section navigation"
          className="af-appshell__icon-button af-appshell__icon-button--sm"
          size="icon-xs"
          onClick={floating.close}
          type="button"
          variant="ghost"
        >
          <PanelLeft aria-hidden="true" size={14} />
        </Button>
      </div>
      <SubLayoutRail rail={rail} />
    </div>
  );
}

function SubLayoutRail({ rail }: { rail: AppShellPrimaryLeftRailConfig }) {
  return <AppShellSubLayoutLeftRail rail={rail} />;
}
