import type { AppShellIconKey } from "../../iconography.shared";
import type { AppShellUtilityIntent } from "./utility-bar-metadata.shared";

export const UTILITY_BAR_MAX_VISIBLE = 14;

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
};

export const UTILITY_BAR_INTENT_ORDER: readonly AppShellUtilityIntent[] = [
  "navigate",
  "inspect",
  "capture",
  "configure",
  "account",
];

export const UTILITY_BAR_CATALOG = [
  {
    id: "org-switcher",
    label: "Organizations",
    description: "Switch the active ERP organization.",
    iconKey: "building-2",
    intent: "navigate",
  },
  {
    id: "app-launcher",
    label: "Launcher",
    description: "Open approved workspace destinations.",
    iconKey: "grid-3x3",
    intent: "navigate",
  },
  {
    id: "command-center",
    label: "Command center",
    description: "Search routes, commands, and context.",
    iconKey: "search",
    intent: "navigate",
  },
  {
    id: "quick-create",
    label: "Quick create",
    description: "Open ERP-published entry points.",
    iconKey: "message-square",
    intent: "configure",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Review operator-facing notices and queues.",
    iconKey: "bell",
    intent: "inspect",
  },
  {
    id: "messenger",
    label: "Messages",
    description: "Open the ERP operator conversation surface.",
    iconKey: "message-circle",
    intent: "inspect",
  },
  {
    id: "coordination",
    label: "Coordination",
    description: "Inspect operational coordination routes and queues.",
    iconKey: "briefcase",
    intent: "inspect",
  },
  {
    id: "lynx",
    label: "Lynx",
    description: "Open Lynx operator surfaces.",
    iconKey: "sparkles",
    intent: "inspect",
  },
  {
    id: "feedback",
    label: "Feedback",
    description: "Capture knowledge and operator feedback.",
    iconKey: "pen-line",
    intent: "configure",
  },
  {
    id: "system-admin",
    label: "System admin",
    description: "Jump to governance and control surfaces.",
    iconKey: "shield-check",
    intent: "configure",
  },
  {
    id: "help",
    label: "Help",
    description: "Open the ERP help surface.",
    iconKey: "circle-help",
    intent: "inspect",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Open ERP settings and governance controls.",
    iconKey: "settings",
    intent: "configure",
  },
  {
    id: "density",
    label: "Density",
    description: "Adjust workspace information density.",
    iconKey: "layout-grid",
    intent: "configure",
  },
  {
    id: "shortcuts",
    label: "Shortcuts",
    description: "Inspect available keyboard shortcuts.",
    iconKey: "keyboard",
    intent: "inspect",
  },
  {
    id: "connectivity",
    label: "Connectivity",
    description: "Inspect browser connection status.",
    iconKey: "wifi",
    intent: "inspect",
  },
  {
    id: "storage",
    label: "Storage",
    description: "Inspect browser local and session storage.",
    iconKey: "database",
    intent: "inspect",
  },
  {
    id: "upload",
    label: "Upload",
    description: "Upload a file into the active organization context.",
    iconKey: "file-up",
    intent: "capture",
  },
  {
    id: "screenshot",
    label: "Screenshot",
    description: "Capture the current shell view.",
    iconKey: "camera",
    intent: "capture",
  },
  {
    id: "diagnosis",
    label: "Diagnosis",
    description: "Inspect local browser diagnostics.",
    iconKey: "scan-search",
    intent: "inspect",
  },
  {
    id: "account",
    label: "Account",
    description: "Open account controls.",
    iconKey: "user-round",
    intent: "account",
  },
] satisfies readonly UtilityBarItemDef[];
