import {
  AppShell,
  type AppShellChrome,
  type AppShellIconKey,
  type AppShellLauncherItem,
  type AppShellOrganizationOption,
  type AppShellUtilityBarMetadata,
  type AppShellUtilityPanelSlots,
} from "@afenda/appshell";
import type { ErpModuleDefinition, NavigationExtension } from "@afenda/kernel";
import Link from "next/link";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/(auth)/actions";
import { loadWorkspaceShellNavigation } from "@/workspace-routes/workspace-route-cache";
import {
  persistWorkspaceAppShellPreferencesAction,
  switchWorkspaceOrganizationAction,
} from "@/workspace-routes/workspace-appshell.actions";
import { readWorkspaceAppShellPreferences } from "@/workspace-routes/workspace-appshell-preferences.server";

const moduleIconById: Record<string, AppShellIconKey> = {
  approvals: "clipboard-check",
  crm: "users",
  dashboard: "layout-dashboard",
  finance: "briefcase",
  hr: "user-round",
  inventory: "shopping-bag",
  purchasing: "building",
  reports: "file-text",
  sales: "activity",
  "system-admin": "shield-check",
};

const extensionIconById: Record<string, AppShellIconKey> = {
  lynx: "sparkles",
};

export async function WorkspaceAppShell({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = await loadWorkspaceShellNavigation();
  const preferences = await readWorkspaceAppShellPreferences();
  const chrome = buildWorkspaceAppShellChrome(navigation, preferences);

  return (
    <AppShell
      actions={{
        persistPreferencesAction: persistWorkspaceAppShellPreferencesAction,
        switchOrganizationAction: switchWorkspaceOrganizationAction,
        signOutAction,
      }}
      chrome={chrome}
      utilityPanels={buildWorkspaceUtilityPanels(navigation)}
    >
      {children}
    </AppShell>
  );
}

type WorkspaceShellNavigation = Awaited<
  ReturnType<typeof loadWorkspaceShellNavigation>
>;

function buildWorkspaceAppShellChrome(
  navigation: WorkspaceShellNavigation,
  preferences: AppShellChrome["preferences"],
): AppShellChrome {
  const { session, organization, accessibleModules, navigationExtensions, posture } =
    navigation;
  const organizations = session.organizations.map<AppShellOrganizationOption>(
    (candidate) => ({
      id: candidate.id,
      name: candidate.name,
      slug: candidate.slug,
      role: candidate.role,
      active: candidate.id === session.activeOrganizationId,
    }),
  );
  const launcherItems = buildLauncherItems({
    accessibleModules,
    navigationExtensions,
  });

  return {
    rail: {
      storageKey: `afenda-workspace-${organization.id}`,
      identity: {
        initials: initialsForOrganization(organization.name),
        primary: organization.name,
        secondary: `${posture.title} · ${session.email}`,
        href: "/dashboard",
      },
      labels: {
        ariaLabel: "Workspace navigation",
        searchPlaceholder: "Filter workspace routes",
        searchAriaLabel: "Filter workspace navigation",
        emptyState: "No matching routes in the workspace shell.",
      },
      sections: [
        {
          id: "workspace",
          label: "Workspace",
          items: [
            ...navigationExtensions.map(extensionToNavItem),
            ...accessibleModules
              .filter((module) => module.id !== "system-admin")
              .map(moduleToNavItem),
          ],
        },
        {
          id: "governance",
          label: "Governance",
          items: accessibleModules
            .filter((module) => module.id === "system-admin")
            .map(moduleToNavItem),
        },
      ].filter((section) => section.items.length > 0),
    },
    utilityBar: {
      brandHomeHref: "/dashboard",
      commandPlaceholder: "Search commands",
      metadata: buildWorkspaceUtilityMetadata(),
      organizations,
      launcherItems,
      account: {
        initials: initialsForName(session.name),
        title: session.name,
        subtitle: `${organization.name} · ${posture.title}`,
        email: session.email,
        href: "/dashboard",
      },
      hrefs: {
        help: "/knowledge",
        settings: "/system-admin",
      },
    },
    commandSections: [
      {
        id: "navigation",
        label: "Navigation",
        items: [
          ...navigationExtensions.map(extensionToCommandItem),
          ...accessibleModules.map(moduleToCommandItem),
        ],
      },
      {
        id: "organization",
        label: "Organizations",
        items: organizations.map((candidate) => ({
          id: `organization.${candidate.id}`,
          label: candidate.name,
          description: candidate.role,
          href: "/dashboard",
          icon: "building-2",
          kind: "inspect",
          keywords: [candidate.slug, candidate.role],
          ...(candidate.active
            ? { shortcut: "Active" }
            : {}),
        })),
      },
    ],
    contextStack: {
      org: {
        id: organization.id,
        label: organization.name,
        description: organization.slug,
        href: "/dashboard",
      },
      workspace: {
        id: organization.role,
        label: posture.title,
        description: posture.description,
      },
      surface: {
        id: "workspace",
        label: "Workspace",
        description: "ERP operator shell",
        href: "/dashboard",
      },
    },
    preferences,
  };
}

function buildWorkspaceUtilityMetadata(): AppShellUtilityBarMetadata {
  return {
    version: 1,
    zones: [
      {
        id: "left",
        items: [
          utilityItem({
            id: "workspace-org-switcher",
            zone: "left",
            kind: "identity",
            intent: "navigate",
            adapterKey: "org-switcher",
            iconKey: "building-2",
            label: "Organizations",
            ariaLabel: "Switch organization",
            priority: 10,
          }),
          utilityItem({
            id: "workspace-launcher",
            zone: "left",
            kind: "navigation-control",
            intent: "navigate",
            adapterKey: "app-launcher",
            iconKey: "grid-3x3",
            label: "Launcher",
            ariaLabel: "Open workspace launcher",
            priority: 20,
          }),
        ],
      },
      {
        id: "center",
        items: [
          utilityItem({
            id: "workspace-command-center",
            zone: "center",
            kind: "command",
            intent: "navigate",
            adapterKey: "command-center",
            iconKey: "search",
            label: "Search commands",
            ariaLabel: "Open command center",
            priority: 10,
          }),
        ],
      },
      {
        id: "right",
        items: [
          utilityItem({
            id: "workspace-quick-create",
            zone: "right",
            kind: "utility-action",
            intent: "configure",
            adapterKey: "quick-create",
            iconKey: "message-square",
            label: "Quick create",
            ariaLabel: "Open quick create",
            priority: 10,
          }),
          utilityItem({
            id: "workspace-notifications",
            zone: "right",
            kind: "utility-action",
            intent: "inspect",
            adapterKey: "notifications",
            iconKey: "bell",
            label: "Notifications",
            ariaLabel: "Open notifications",
            priority: 20,
          }),
          utilityItem({
            id: "workspace-lynx",
            zone: "right",
            kind: "utility-action",
            intent: "inspect",
            adapterKey: "lynx",
            iconKey: "sparkles",
            label: "Lynx",
            ariaLabel: "Open Lynx panel",
            priority: 30,
          }),
          utilityItem({
            id: "workspace-feedback",
            zone: "right",
            kind: "utility-action",
            intent: "configure",
            adapterKey: "feedback",
            iconKey: "pen-line",
            label: "Feedback",
            ariaLabel: "Open feedback panel",
            priority: 40,
          }),
          utilityItem({
            id: "workspace-system-admin",
            zone: "right",
            kind: "utility-action",
            intent: "configure",
            adapterKey: "system-admin",
            iconKey: "shield-check",
            label: "System admin",
            ariaLabel: "Open system admin panel",
            priority: 50,
          }),
          utilityItem({
            id: "workspace-help",
            zone: "right",
            kind: "utility-action",
            intent: "inspect",
            adapterKey: "help",
            iconKey: "circle-help",
            href: "/knowledge",
            label: "Help",
            ariaLabel: "Open help",
            priority: 60,
          }),
          utilityItem({
            id: "workspace-settings",
            zone: "right",
            kind: "utility-action",
            intent: "configure",
            adapterKey: "settings",
            iconKey: "settings",
            href: "/system-admin",
            label: "Settings",
            ariaLabel: "Open system admin",
            priority: 70,
          }),
          utilityItem({
            id: "workspace-density",
            zone: "right",
            kind: "configuration",
            intent: "configure",
            adapterKey: "density",
            iconKey: "layout-grid",
            label: "Density",
            ariaLabel: "Change shell density",
            priority: 80,
          }),
          utilityItem({
            id: "workspace-shortcuts",
            zone: "right",
            kind: "configuration",
            intent: "inspect",
            adapterKey: "shortcuts",
            iconKey: "keyboard",
            label: "Shortcuts",
            ariaLabel: "Show keyboard shortcuts",
            priority: 90,
          }),
          utilityItem({
            id: "workspace-connectivity",
            zone: "right",
            kind: "utility-action",
            intent: "inspect",
            adapterKey: "connectivity",
            iconKey: "wifi",
            label: "Connectivity",
            ariaLabel: "Open connectivity panel",
            priority: 100,
          }),
          utilityItem({
            id: "workspace-storage",
            zone: "right",
            kind: "utility-action",
            intent: "inspect",
            adapterKey: "storage",
            iconKey: "database",
            label: "Storage",
            ariaLabel: "Open storage panel",
            priority: 110,
          }),
          utilityItem({
            id: "workspace-upload",
            zone: "right",
            kind: "utility-action",
            intent: "capture",
            adapterKey: "upload",
            iconKey: "file-up",
            label: "Upload",
            ariaLabel: "Open upload panel",
            priority: 120,
          }),
          utilityItem({
            id: "workspace-screenshot",
            zone: "right",
            kind: "utility-action",
            intent: "capture",
            adapterKey: "screenshot",
            iconKey: "camera",
            label: "Screenshot",
            ariaLabel: "Open screenshot panel",
            priority: 130,
          }),
          utilityItem({
            id: "workspace-diagnosis",
            zone: "right",
            kind: "utility-action",
            intent: "inspect",
            adapterKey: "diagnosis",
            iconKey: "scan-search",
            label: "Diagnosis",
            ariaLabel: "Open diagnosis panel",
            priority: 140,
          }),
          utilityItem({
            id: "workspace-account",
            zone: "right",
            kind: "account-anchor",
            intent: "account",
            adapterKey: "account",
            iconKey: "user-round",
            label: "Account",
            ariaLabel: "Open account menu",
            priority: 150,
          }),
        ],
      },
    ],
  };
}

function buildWorkspaceUtilityPanels(
  navigation: WorkspaceShellNavigation,
): AppShellUtilityPanelSlots {
  const moduleLinks = navigation.accessibleModules
    .filter((module) => module.id !== "dashboard")
    .slice(0, 6);

  return {
    lynx: (
      <PanelLinkList
        description="Lynx operator surfaces and governed retrieval routes."
        links={[
          { href: "/lynx", label: "Open Lynx", detail: "Run and inspect machine workflows." },
          { href: "/knowledge", label: "Knowledge", detail: "Inspect governed knowledge sources." },
        ]}
        title="Lynx"
      />
    ),
    notifications: (
      <PanelLinkList
        description="Operator queues and surfaced workflow pressure."
        links={moduleLinks.map((module) => ({
          href: module.href,
          label: module.navigationLabel,
          detail: module.status.label,
        }))}
        title="Notifications"
      />
    ),
    feedback: (
      <PanelLinkList
        description="Workspace knowledge and system routes for operator feedback."
        links={[
          { href: "/knowledge", label: "Knowledge hub", detail: "Capture process notes and governed context." },
          { href: "/system-admin", label: "System admin", detail: "Review operational controls and policies." },
        ]}
        title="Feedback"
      />
    ),
    "system-admin": (
      <PanelLinkList
        description="Tenant governance routes retained under ERP ownership."
        links={[
          { href: "/system-admin", label: "System admin hub", detail: "Tenant governance overview." },
          { href: "/system-admin/approvals", label: "Approvals governance", detail: "Approval-specific oversight." },
        ]}
        title="System admin"
      />
    ),
    "quick-create": (
      <PanelLinkList
        description="Fast entry points published by the ERP workspace."
        links={moduleLinks.map((module) => ({
          href: module.href,
          label: `Open ${module.navigationLabel}`,
          detail: module.ownerTeam,
        }))}
        title="Quick create"
      />
    ),
  };
}

function moduleToNavItem(module: ErpModuleDefinition) {
  return {
    id: module.id,
    label: module.navigationLabel,
    description: module.description,
    href: module.href,
    icon: moduleIconById[module.id] ?? "list",
    ...(module.status.tone === "warning"
      ? {
          badge: {
            label: module.status.label,
            tone: "attention" as const,
          },
        }
      : {}),
  };
}

function extensionToNavItem(extension: NavigationExtension) {
  return {
    id: extension.id,
    label: extension.label,
    description: extension.description,
    href: extension.href,
    icon: extensionIconById[extension.id] ?? "sparkles",
  };
}

function moduleToCommandItem(module: ErpModuleDefinition) {
  return {
    id: `module.${module.id}`,
    label: `Open ${module.navigationLabel}`,
    description: module.description,
    href: module.href,
    icon: moduleIconById[module.id] ?? "list",
    kind: "navigation" as const,
    keywords: [module.id, module.ownerTeam, module.status.label],
  };
}

function extensionToCommandItem(extension: NavigationExtension) {
  return {
    id: `extension.${extension.id}`,
    label: `Open ${extension.label}`,
    description: extension.description,
    href: extension.href,
    icon: extensionIconById[extension.id] ?? "sparkles",
    kind: "navigation" as const,
    keywords: [extension.id, extension.status.label],
  };
}

function buildLauncherItems({
  accessibleModules,
  navigationExtensions,
}: {
  accessibleModules: readonly ErpModuleDefinition[];
  navigationExtensions: readonly NavigationExtension[];
}) {
  const items = new Map<string, AppShellLauncherItem>();

  items.set("dashboard", {
    id: "dashboard",
    label: "Dashboard",
    description: "Workspace overview and operating posture.",
    href: "/dashboard",
    icon: "layout-dashboard",
    group: "Workspace",
  });

  for (const extension of navigationExtensions) {
    items.set(`extension.${extension.id}`, {
      id: `extension.${extension.id}`,
      label: extension.label,
      description: extension.description,
      href: extension.href,
      icon: extensionIconById[extension.id] ?? "sparkles",
      group: "Extensions",
    });
  }

  for (const module of accessibleModules) {
    items.set(`module.${module.id}`, {
      id: `module.${module.id}`,
      label: module.navigationLabel,
      description: module.description,
      href: module.href,
      icon: moduleIconById[module.id] ?? "list",
      group: module.id === "system-admin" ? "Governance" : "Modules",
    });
  }

  items.set("knowledge", {
    id: "knowledge",
    label: "Knowledge",
    description: "Governed knowledge substrate and document context.",
    href: "/knowledge",
    icon: "file-text",
    group: "Workspace",
  });

  return [...items.values()];
}

function utilityItem(
  input: AppShellUtilityBarMetadata["zones"][number]["items"][number],
) {
  return input;
}

function initialsForOrganization(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "AF";
}

function initialsForName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "OP";
}

function PanelLinkList({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: Array<{ href: string; label: string; detail: string }>;
}) {
  return (
      <div className="grid gap-3">
        <div className="grid gap-1">
          <div className="type-body font-medium text-foreground">{title}</div>
          <div className="type-muted">{description}</div>
        </div>
      <div className="grid gap-2">
        {links.map((link) => (
          <Link
            className="rounded-card border border-border/60 px-3 py-2 transition-colors hover:border-border hover:bg-accent"
            href={link.href}
            key={`${link.href}:${link.label}`}
          >
            <div className="type-body font-medium text-foreground">
              {link.label}
            </div>
            <div className="type-muted">
              {link.detail}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
