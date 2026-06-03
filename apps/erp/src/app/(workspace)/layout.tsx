import {
  AppShell,
  type AppShellChrome,
  type AppShellPrimaryLeftRailNavIconId,
} from "@afenda/appshell";
import { getAccessibleModules } from "@afenda/kernel";
import { getWorkspaceExecutionContext } from "@/workspace-routes/execution-context.server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const iconByModule: Record<string, AppShellPrimaryLeftRailNavIconId> = {
  dashboard: "layout-dashboard",
  finance: "briefcase",
  sales: "shopping-bag",
  purchasing: "store",
  inventory: "database",
  hr: "users",
  crm: "message-square",
  approvals: "clipboard-check",
  reports: "file-text",
  "system-admin": "shield-check",
};

function buildWorkspaceChrome(
  context: NonNullable<Awaited<ReturnType<typeof getWorkspaceExecutionContext>>>,
): AppShellChrome {
  const modules = getAccessibleModules(context.capabilities);
  const moduleItems = modules.map((module) => ({
    id: module.id,
    label: module.navigationLabel,
    description: module.description,
    href: module.href,
    match: "prefix" as const,
    icon: iconByModule[module.id] ?? "layout-grid",
  }));

  const machineItems = [
    {
      id: "lynx",
      label: "Lynx",
      description: "Truth retrieval, operator runs, and workflow sessions.",
      href: "/lynx",
      match: "prefix" as const,
      icon: "sparkles" as const,
      items: [
        { id: "lynx-workflows", label: "Workflows", href: "/lynx/workflows" },
        { id: "lynx-runs", label: "Runs", href: "/lynx/runs" },
      ],
    },
  ];

  return {
    rail: {
      storageKey: "afenda.workspace.left-rail",
      identity: {
        primary: context.organizationSlug,
        secondary: context.role,
        href: "/dashboard",
      },
      labels: {
        ariaLabel: "Workspace navigation",
        searchPlaceholder: "Filter workspace routes",
        searchAriaLabel: "Filter workspace routes",
        emptyState: "No workspace routes match.",
      },
      sections: [
        { id: "machine", label: "Machine", items: machineItems },
        { id: "modules", label: "ERP", items: moduleItems },
      ],
    },
    utilityBar: {
      brandHomeHref: "/dashboard",
      commandPlaceholder: "Search workspace",
      metadata: {
        version: 1,
        zones: [
          { id: "left", items: [] },
          { id: "center", items: [] },
          { id: "right", items: [] },
        ],
      },
      organizations: [
        {
          id: context.organizationId,
          name: context.organizationSlug,
          slug: context.organizationSlug,
          role: context.role,
          active: true,
        },
      ],
      launcherItems: [
        {
          id: "lynx",
          label: "Lynx",
          description: "Open the machine-layer console.",
          href: "/lynx",
          icon: "sparkles",
          group: "Machine",
        },
        ...modules.map((module) => ({
          id: module.id,
          label: module.label,
          description: module.summary,
          href: module.href,
          icon: iconByModule[module.id] ?? "layout-grid",
          group: "ERP",
        })),
      ],
      account: {
        initials: context.userId.slice(0, 2).toUpperCase(),
        title: context.userId,
        subtitle: context.role,
        email: context.userId,
        href: "/account",
      },
      hrefs: {
        settings: "/system-admin/organization",
      },
    },
    commandSections: [
      {
        id: "machine",
        label: "Machine",
        items: [
          {
            id: "lynx",
            label: "Lynx",
            description: "Open the Lynx console.",
            href: "/lynx",
            icon: "sparkles",
            kind: "navigation",
            keywords: ["machine", "operator"],
          },
          {
            id: "lynx-runs",
            label: "Lynx runs",
            href: "/lynx/runs",
            icon: "activity",
            kind: "inspect",
            keywords: ["runs", "ledger"],
          },
          {
            id: "lynx-workflows",
            label: "Lynx workflows",
            href: "/lynx/workflows",
            icon: "clipboard-check",
            kind: "workflow",
            keywords: ["sessions", "outcomes"],
          },
        ],
      },
    ],
    contextStack: null,
    preferences: {
      railMode: "expanded",
      density: "comfortable",
      utilityOrder: [],
      commandRecents: [],
    },
  };
}

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await getWorkspaceExecutionContext();
  if (!context) {
    redirect("/sign-in");
  }

  return <AppShell chrome={buildWorkspaceChrome(context)}>{children}</AppShell>;
}
