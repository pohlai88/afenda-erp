import { render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { AppShellClient } from "../src/client";
import type { AppShellChrome } from "../src/server";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: ComponentPropsWithoutRef<"a"> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const chrome: AppShellChrome = {
  rail: {
    storageKey: "workspace",
    identity: {
      initials: "AF",
      primary: "Afenda",
      secondary: "operator@example.com",
    },
    labels: {
      ariaLabel: "Workspace navigation",
      searchPlaceholder: "Filter routes",
      searchAriaLabel: "Filter navigation",
      emptyState: "No routes",
    },
    sections: [
      {
        id: "workspace",
        label: "Workspace",
        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            href: "/dashboard",
            icon: "layout-dashboard",
          },
        ],
      },
    ],
  },
  utilityBar: {
    brandHomeHref: "/dashboard",
    commandPlaceholder: "Search commands",
    metadata: {
      version: 1,
      zones: [
        { id: "left", items: [] },
        { id: "center", items: [] },
        {
          id: "right",
          items: [
            {
              id: "workspace-account",
              zone: "right",
              kind: "account-anchor",
              intent: "account",
              adapterKey: "account",
              iconKey: "user-round",
              label: "Account",
              ariaLabel: "Open account menu",
              priority: 10,
            },
          ],
        },
      ],
    },
    organizations: [],
    launcherItems: [],
    account: {
      initials: "AF",
      title: "Afenda",
      email: "operator@example.com",
    },
  },
  commandSections: [
    {
      id: "navigation",
      label: "Navigation",
      items: [
        {
          id: "nav.dashboard",
          label: "Open dashboard",
          href: "/dashboard",
          icon: "layout-dashboard",
          kind: "navigation",
          keywords: ["dashboard"],
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

describe("AppShellClient", () => {
  it("renders rail navigation and workspace content", () => {
    render(
      <AppShellClient chrome={chrome}>
        <div>Workspace content</div>
      </AppShellClient>,
    );

    expect(screen.getByRole("navigation")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Dashboard" }).getAttribute("href"),
    ).toBe("/dashboard");
    expect(screen.getByText("Workspace content")).toBeTruthy();
  });
});
