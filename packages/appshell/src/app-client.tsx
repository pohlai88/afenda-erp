"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { TooltipProvider } from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

import { normalizeCommandRecentIds } from "./app-command-recents-shared";
import { AppShellGlobalShortcuts } from "./app-appshell-global-shortcuts-client";
import { AppShellPreferenceSync } from "./app-appshell-preference-sync-client";
import { AppShellSkipToMain } from "./app-appshell-skip-to-main";
import { AppShellOrgNotificationDelivery } from "./app-appshell-org-notification-delivery-client";
import { AppShellQuickPushMount } from "./app-appshell-quick-push-mount-client";
import type {
  AppShellChromeProps,
  AppShellRailMode,
} from "./app-appshell-props-shared";
import {
  AppShellOperationalContextProvider,
  useAppShellOperationalContextEntries,
} from "./app-operational-context-stack-client";
import { AppShellUtilityBar } from "./app-utility-bar";
import { CommandPalette } from "./app-command-palette-client";
import { AppShellPrimaryLeftRail } from "./app-appshell-primary-left-rail-client";
import { AppShellPrimaryLeftRailFooter } from "./app-appshell-primary-left-rail-footer-client";
import { AppShellContextMenu } from "./app-appshell-context-menu-client";

type AppShellRuntime = {
  railMode: AppShellRailMode;
  setRailMode: Dispatch<SetStateAction<AppShellRailMode>>;
  density: "comfortable" | "compact";
  setDensity: Dispatch<SetStateAction<"comfortable" | "compact">>;
  commandOpen: boolean;
  setCommandOpen: Dispatch<SetStateAction<boolean>>;
  commandRecents: readonly string[];
  setCommandRecents: Dispatch<SetStateAction<readonly string[]>>;
  recordCommand: (id: string) => void;
};

const AppShellRuntimeContext = createContext<AppShellRuntime | null>(null);

export function useAppShellRuntime() {
  const runtime = useContext(AppShellRuntimeContext);
  if (!runtime) {
    throw new Error("useAppShellRuntime must be used inside AppShellClient.");
  }
  return runtime;
}

export function AppShellClient({
  chrome,
  actions,
  overlays,
  utilityPanels,
  children,
}: AppShellChromeProps) {
  const [railMode, setRailMode] = useState<AppShellRailMode>(
    () => chrome.preferences.railMode,
  );
  const [density, setDensity] = useState<"comfortable" | "compact">(() =>
    chrome.preferences.density === "compact" ? "compact" : "comfortable",
  );
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandRecents, setCommandRecents] = useState<readonly string[]>(() =>
    normalizeCommandRecentIds(chrome.preferences.commandRecents),
  );

  const recordCommand = useCallback((id: string) => {
    setCommandRecents((current) => normalizeCommandRecentIds([id, ...current]));
  }, []);

  const runtime = useMemo<AppShellRuntime>(
    () => ({
      railMode,
      setRailMode,
      density,
      setDensity,
      commandOpen,
      setCommandOpen,
      commandRecents,
      setCommandRecents,
      recordCommand,
    }),
    [commandOpen, commandRecents, density, railMode, recordCommand],
  );

  return (
    <AppShellOperationalContextProvider baseStack={chrome.contextStack}>
      <AppShellRuntimeContext.Provider value={runtime}>
        <TooltipProvider>
          <AppShellPreferenceSync actions={actions} preferences={chrome.preferences} />
          <AppShellGlobalShortcuts />
          <AppShellOrgNotificationDelivery />
          <AppShellChromeBody
            actions={actions}
            chrome={chrome}
            commandOpen={commandOpen}
            commandRecents={commandRecents}
            density={density}
            railMode={railMode}
            recordCommand={recordCommand}
            setCommandOpen={setCommandOpen}
            setRailMode={setRailMode}
            overlays={overlays}
            utilityPanels={utilityPanels}
          >
            {children}
          </AppShellChromeBody>
        </TooltipProvider>
      </AppShellRuntimeContext.Provider>
    </AppShellOperationalContextProvider>
  );
}

function AppShellChromeBody({
  chrome,
  actions,
  overlays,
  utilityPanels,
  children,
  railMode,
  setRailMode,
  density,
  commandOpen,
  setCommandOpen,
  commandRecents,
  recordCommand,
}: AppShellChromeProps & {
  railMode: AppShellRailMode;
  setRailMode: Dispatch<SetStateAction<AppShellRailMode>>;
  density: "comfortable" | "compact";
  commandOpen: boolean;
  setCommandOpen: Dispatch<SetStateAction<boolean>>;
  commandRecents: readonly string[];
  recordCommand: (id: string) => void;
}) {
  const contextEntries = useAppShellOperationalContextEntries();

  return (
    <>
      <AppShellSkipToMain label="Skip to workspace content" />
      <div
        className={cn(
          "af-appshell",
          railMode === "collapsed" && "af-appshell--rail-collapsed",
          railMode === "hover" && "af-appshell--rail-hover",
        )}
        data-density={density}
      >
        <AppShellUtilityBar
          actions={actions}
          onOpenCommand={() => setCommandOpen(true)}
          onToggleRail={() =>
            setRailMode((current) =>
              current === "collapsed" ? "expanded" : "collapsed",
            )
          }
          railMode={railMode}
          utilityBar={chrome.utilityBar}
          utilityPanels={utilityPanels}
        />
        <div className="af-appshell__body">
          {chrome.rail ? (
            <aside
              aria-label={chrome.rail.labels.ariaLabel}
              className="af-appshell__rail"
              data-rail-mode={railMode}
            >
              <div className="af-appshell__rail-scroll">
                <AppShellPrimaryLeftRail
                  config={chrome.rail}
                  displayMode={
                    railMode === "collapsed" || railMode === "hover"
                      ? "compact"
                      : "full"
                  }
                />
              </div>
              <div className="af-appshell__rail-footer">
                <AppShellPrimaryLeftRailFooter />
              </div>
            </aside>
          ) : null}
          <div className="af-appshell__workspace">
            <AppShellContextMenu>
              <main className="af-appshell__main" id="app-shell-main" tabIndex={-1}>
                {children}
              </main>
            </AppShellContextMenu>
          </div>
        </div>
        <CommandPalette
          commandOpen={commandOpen}
          commands={chrome.commandSections}
          contextEntries={contextEntries}
          onSelectCommand={recordCommand}
          recentIds={commandRecents}
          setCommandOpen={setCommandOpen}
        />
        <AppShellQuickPushMount>{overlays?.quickPush}</AppShellQuickPushMount>
      </div>
    </>
  );
}
