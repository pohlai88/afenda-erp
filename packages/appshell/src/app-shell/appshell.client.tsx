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

import { normalizeCommandRecentIds } from "./command/command-recents.shared";
import { AppShellGlobalShortcuts } from "./appshell-global-shortcuts.client";
import { AppShellPreferenceSync } from "./appshell-preference-sync.client";
import { AppShellSkipToMain } from "./appshell-skip-to-main";
import { AppShellOrgNotificationDelivery } from "./appshell-org-notification-delivery.client";
import { AppShellQuickPushMount } from "./quick-push/appshell-quick-push-mount.client";
import type {
  AppShellChromeProps,
  AppShellRailMode,
} from "./appshell-props.shared";
import {
  AppShellOperationalContextProvider,
  useAppShellOperationalContextEntries,
} from "./operational-context-stack.client";
import { AppShellUtilityBar } from "./top-utils-bar/zones/utility-bar";
import { CommandPalette } from "./top-utils-bar/command/command-palette.client";
import { AppShellPrimaryLeftRail } from "./left-rail-bar/appshell-primary-left-rail.client";
import { AppShellContextMenu } from "./left-rail-bar/appshell-context-menu.client";

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
  utilityOrder: readonly string[];
  setUtilityOrder: Dispatch<SetStateAction<readonly string[]>>;
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
  const [utilityOrder, setUtilityOrder] = useState<readonly string[]>(() =>
    normalizeCommandRecentIds(chrome.preferences.utilityOrder, 32),
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
      utilityOrder,
      setUtilityOrder,
    }),
    [commandOpen, commandRecents, density, railMode, recordCommand, utilityOrder],
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
            utilityOrder={utilityOrder}
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
  utilityOrder,
}: AppShellChromeProps & {
  railMode: AppShellRailMode;
  setRailMode: Dispatch<SetStateAction<AppShellRailMode>>;
  density: "comfortable" | "compact";
  commandOpen: boolean;
  setCommandOpen: Dispatch<SetStateAction<boolean>>;
  commandRecents: readonly string[];
  recordCommand: (id: string) => void;
  utilityOrder: readonly string[];
}) {
  const contextEntries = useAppShellOperationalContextEntries();
  const orderedUtilityBar = useMemo(
    () => applyUtilityOrder(chrome.utilityBar, utilityOrder),
    [chrome.utilityBar, utilityOrder],
  );

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
          utilityBar={orderedUtilityBar}
          utilityPanels={utilityPanels}
        />
        <div className="af-appshell__body">
          {chrome.rail ? (
            <aside
              aria-label={chrome.rail.labels.ariaLabel}
              className="af-appshell__rail"
              data-rail-mode={railMode}
            >
              <AppShellPrimaryLeftRail
                config={chrome.rail}
                displayMode={
                  railMode === "collapsed" || railMode === "hover"
                    ? "compact"
                    : "full"
                }
              />
            </aside>
          ) : null}
          <AppShellContextMenu>
            <main className="af-appshell__main" id="app-shell-main" tabIndex={-1}>
              {children}
            </main>
          </AppShellContextMenu>
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

function applyUtilityOrder(
  utilityBar: AppShellChromeProps["chrome"]["utilityBar"],
  utilityOrder: readonly string[],
) {
  if (utilityOrder.length === 0) {
    return utilityBar;
  }

  const priorityById = new Map(utilityOrder.map((id, index) => [id, index]));

  return {
    ...utilityBar,
    metadata: {
      ...utilityBar.metadata,
      zones: utilityBar.metadata.zones.map((zone) => ({
        ...zone,
        items: [...zone.items].sort((left, right) => {
          const leftIndex = priorityById.get(left.id);
          const rightIndex = priorityById.get(right.id);
          if (leftIndex === undefined && rightIndex === undefined) {
            return left.priority - right.priority;
          }
          if (leftIndex === undefined) {
            return 1;
          }
          if (rightIndex === undefined) {
            return -1;
          }
          return leftIndex - rightIndex;
        }),
      })),
    },
  };
}
