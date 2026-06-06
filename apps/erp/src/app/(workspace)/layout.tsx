import {
  AppShell,
  type AppShellChrome,
  type AppShellPrimaryLeftRailNavIconId,
} from "@afenda/appshell";
import { readNeonAuthSessionPayload } from "@afenda/auth/neon-auth/server";
import { getAccessibleModules } from "@afenda/kernel";
import { getWorkspaceExecutionContext } from "@/routes/execution-context-route.server";
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

function hasCapability(
  capabilities: readonly string[],
  capability: string,
): boolean {
  return capabilities.includes(capability);
}

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

  const canReadLynx = hasCapability(
    context.capabilities,
    "system-admin.lynx.read",
  );
  const machineItems = canReadLynx
    ? [
        {
          id: "lynx",
          label: "Lynx",
          description: "Truth retrieval, operator runs, and workflow sessions.",
          href: "/lynx",
          match: "prefix" as const,
          icon: "sparkles" as const,
          items: [
            {
              id: "lynx-workflows",
              label: "Workflows",
              href: "/lynx/workflows",
            },
            { id: "lynx-runs", label: "Runs", href: "/lynx/runs" },
          ],
        },
      ]
    : [];

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
        ...(canReadLynx
          ? [
              {
                id: "lynx",
                label: "Lynx",
                description: "Open the machine-layer console.",
                href: "/lynx",
                icon: "sparkles" as const,
                group: "Machine",
              },
            ]
          : []),
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
    commandSections: canReadLynx
      ? [
          {
            id: "machine",
            label: "Machine",
            items: [
              {
                id: "lynx",
                label: "Lynx",
                description: "Open the Lynx console.",
                href: "/lynx",
                icon: "sparkles" as const,
                kind: "navigation" as const,
                keywords: ["machine", "operator"],
              },
              {
                id: "lynx-runs",
                label: "Lynx runs",
                href: "/lynx/runs",
                icon: "activity" as const,
                kind: "inspect" as const,
                keywords: ["runs", "ledger"],
              },
              {
                id: "lynx-workflows",
                label: "Lynx workflows",
                href: "/lynx/workflows",
                icon: "clipboard-check" as const,
                kind: "workflow" as const,
                keywords: ["sessions", "outcomes"],
              },
            ],
          },
        ]
      : [],
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
  const [context, session] = await Promise.all([
    getWorkspaceExecutionContext(),
    readNeonAuthSessionPayload(),
  ]);

  if (!context) {
    if (session?.session && session?.user) {
      redirect("/onboarding");
    }

    redirect("/sign-in");
  }

  return <AppShell chrome={buildWorkspaceChrome(context)}>{children}</AppShell>;
}
