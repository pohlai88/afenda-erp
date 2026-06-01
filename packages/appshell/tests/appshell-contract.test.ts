import { describe, expect, it } from "vitest";

import {
  normalizeCommandRecentIds,
  parseAppShellChrome,
} from "../src/server";

describe("AppShell contracts", () => {
  it("parses serializable chrome metadata", () => {
    expect(
      parseAppShellChrome({
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
              { id: "right", items: [] },
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
        commandSections: [],
        contextStack: null,
        preferences: {
          railMode: "expanded",
          density: "comfortable",
          utilityOrder: [],
          commandRecents: [],
        },
      }).preferences.railMode,
    ).toBe("expanded");
  });

  it("keeps command recents id-only and bounded", () => {
    expect(
      normalizeCommandRecentIds([" dashboard ", "", "finance", "dashboard"]),
    ).toEqual(["dashboard", "finance"]);
  });
});
