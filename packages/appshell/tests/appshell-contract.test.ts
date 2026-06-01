import { describe, expect, it } from "vitest";

import { createEmptyAppShellChrome, parseAppShellChrome } from "../src";

describe("AppShell DTO contracts", () => {
  it("parses serializable chrome DTOs with defaults", () => {
    const chrome = parseAppShellChrome({
      version: 1,
      title: "Finance workspace",
      utilityBar: {
        left: [{ id: "new", label: "New", href: "/dashboard" }],
      },
      primaryRail: {
        workspaceLabel: "Afenda ERP",
        sections: [
          {
            id: "core",
            label: "Core",
            items: [{ id: "dashboard", label: "Dashboard", href: "/dashboard" }],
          },
        ],
      },
      command: {
        items: [{ id: "dashboard", label: "Open dashboard", href: "/dashboard" }],
      },
    });

    expect(chrome.utilityBar.commandTriggerLabel).toBe("Command");
    expect(chrome.command.placeholder).toBe("Search actions and records");
    expect(chrome.primaryRail.sections[0]?.items[0]?.href).toBe("/dashboard");
  });

  it("rejects callbacks and unknown runtime authority fields", () => {
    expect(() =>
      parseAppShellChrome({
        version: 1,
        title: "Workspace",
        utilityBar: {},
        primaryRail: {
          workspaceLabel: "Afenda ERP",
          rawPermissions: ["admin"],
        },
        command: {
          items: [
            {
              id: "post",
              label: "Post invoice",
              onSelect: () => undefined,
            },
          ],
        },
      }),
    ).toThrow();
  });

  it("keeps generated empty chrome serializable", () => {
    const chrome = createEmptyAppShellChrome({
      title: "Operations",
      workspaceLabel: "Afenda Operations",
    });

    expect(JSON.parse(JSON.stringify(chrome))).toEqual(chrome);
  });
});
