import type { AppShellIconKey } from "../../iconography.shared";
import type { AppShellUtilityIntent } from "./utility-bar-metadata.shared";

/** Maximum visible right-rail utility actions on desktop; account is fixed outside this cap. */
export const UTILITY_BAR_DESKTOP_VISIBLE_ICON_CAP = 6;

/** Maximum visible right-rail utility actions on mobile; account is fixed outside this cap. */
export const UTILITY_BAR_MOBILE_VISIBLE_ICON_CAP = 3;

/**
 * Maximum visible right-rail slots including the fixed account anchor.
 */
export const UTILITY_BAR_MAX_VISIBLE = UTILITY_BAR_DESKTOP_VISIBLE_ICON_CAP + 1;

export const APP_SHELL_UTILITY_ADAPTER_KEYS = [
  "org-switcher",
  "app-launcher",
  "command-center",
  "quick-create",
  "notifications",
  "messenger",
  "coordination",
  "lynx",
  "feedback",
  "system-admin",
  "help",
  "settings",
  "density",
  "shortcuts",
  "connectivity",
  "storage",
  "upload",
  "screenshot",
  "diagnosis",
  "account",
] as const;

export type AppShellUtilityAdapterKey =
  (typeof APP_SHELL_UTILITY_ADAPTER_KEYS)[number];
export type UtilityBarItemId = AppShellUtilityAdapterKey;

export type UtilityBarItemDef = {
  id: UtilityBarItemId;
  label: string;
  description: string;
  iconKey: AppShellIconKey;
  intent: AppShellUtilityIntent;
  defaultVisible: boolean;
  defaultOrder: number;
};

export const UTILITY_BAR_INTENT_ORDER: readonly AppShellUtilityIntent[] = [
  "navigate",
  "inspect",
  "capture",
  "configure",
  "account",
];

/** Right-rail utilities the operator can show, hide, and reorder (account excluded). */
export const RIGHT_UTILITY_BAR_CATALOG = [
  {
    id: "quick-create",
    label: "Quick create",
    description: "Open ERP-published entry points.",
    iconKey: "message-square",
    intent: "configure",
    defaultVisible: true,
    defaultOrder: 0,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Review operator-facing notices and queues.",
    iconKey: "bell",
    intent: "inspect",
    defaultVisible: true,
    defaultOrder: 1,
  },
  {
    id: "messenger",
    label: "Messages",
    description: "Open the ERP operator conversation surface.",
    iconKey: "message-circle",
    intent: "inspect",
    defaultVisible: true,
    defaultOrder: 2,
  },
  {
    id: "coordination",
    label: "Coordination",
    description: "Inspect operational coordination routes and queues.",
    iconKey: "briefcase",
    intent: "inspect",
    defaultVisible: true,
    defaultOrder: 3,
  },
  {
    id: "lynx",
    label: "Lynx",
    description: "Open Lynx operator surfaces.",
    iconKey: "sparkles",
    intent: "inspect",
    defaultVisible: true,
    defaultOrder: 4,
  },
  {
    id: "feedback",
    label: "Feedback",
    description: "Capture knowledge and operator feedback.",
    iconKey: "pen-line",
    intent: "configure",
    defaultVisible: true,
    defaultOrder: 5,
  },
  {
    id: "system-admin",
    label: "System admin",
    description: "Jump to governance and control surfaces.",
    iconKey: "shield-check",
    intent: "configure",
    defaultVisible: false,
    defaultOrder: 6,
  },
  {
    id: "help",
    label: "Help",
    description: "Open the ERP help surface.",
    iconKey: "circle-help",
    intent: "inspect",
    defaultVisible: false,
    defaultOrder: 7,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Open ERP settings and governance controls.",
    iconKey: "settings",
    intent: "configure",
    defaultVisible: false,
    defaultOrder: 8,
  },
  {
    id: "density",
    label: "Density",
    description: "Adjust workspace information density.",
    iconKey: "layout-grid",
    intent: "configure",
    defaultVisible: false,
    defaultOrder: 9,
  },
  {
    id: "shortcuts",
    label: "Shortcuts",
    description: "Inspect available keyboard shortcuts.",
    iconKey: "keyboard",
    intent: "inspect",
    defaultVisible: false,
    defaultOrder: 10,
  },
  {
    id: "connectivity",
    label: "Connectivity",
    description: "Inspect browser connection status.",
    iconKey: "wifi",
    intent: "inspect",
    defaultVisible: false,
    defaultOrder: 11,
  },
  {
    id: "storage",
    label: "Storage",
    description: "Inspect browser local and session storage.",
    iconKey: "database",
    intent: "inspect",
    defaultVisible: false,
    defaultOrder: 12,
  },
  {
    id: "upload",
    label: "Upload",
    description: "Upload a file into the active organization context.",
    iconKey: "file-up",
    intent: "capture",
    defaultVisible: false,
    defaultOrder: 13,
  },
  {
    id: "screenshot",
    label: "Screenshot",
    description: "Capture the current shell view.",
    iconKey: "camera",
    intent: "capture",
    defaultVisible: false,
    defaultOrder: 14,
  },
  {
    id: "diagnosis",
    label: "Diagnosis",
    description: "Inspect local browser diagnostics.",
    iconKey: "scan-search",
    intent: "inspect",
    defaultVisible: false,
    defaultOrder: 15,
  },
] satisfies readonly UtilityBarItemDef[];

export const UTILITY_BAR_CATALOG = [
  {
    id: "org-switcher",
    label: "Organizations",
    description: "Switch the active ERP organization.",
    iconKey: "building-2",
    intent: "navigate",
    defaultVisible: true,
    defaultOrder: 0,
  },
  {
    id: "app-launcher",
    label: "Launcher",
    description: "Open approved workspace destinations.",
    iconKey: "grid-3x3",
    intent: "navigate",
    defaultVisible: true,
    defaultOrder: 1,
  },
  {
    id: "command-center",
    label: "Command center",
    description: "Search routes, commands, and context.",
    iconKey: "search",
    intent: "navigate",
    defaultVisible: true,
    defaultOrder: 2,
  },
  ...RIGHT_UTILITY_BAR_CATALOG,
  {
    id: "account",
    label: "Account",
    description: "Open account controls.",
    iconKey: "user-round",
    intent: "account",
    defaultVisible: true,
    defaultOrder: 1000,
  },
] satisfies readonly UtilityBarItemDef[];
