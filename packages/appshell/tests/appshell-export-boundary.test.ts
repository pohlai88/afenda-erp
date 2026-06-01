import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const packageRoot = join(import.meta.dirname, "..");

describe("AppShell export boundaries", () => {
  it("keeps the client door free of server-only dependencies", () => {
    const clientEntry = readFileSync(join(packageRoot, "src", "client.ts"), "utf8");

    expect(clientEntry).not.toContain("./server");
    expect(clientEntry).not.toContain("server-only");
    expect(clientEntry).not.toContain("@afenda/auth");
    expect(clientEntry).not.toContain("@afenda/db");
  });

  it("exposes stable public doors", async () => {
    const root = await import("../src");
    const client = await import("../src/client");
    const server = await import("../src/server");

    expect(root.parseAppShellChrome).toBeTypeOf("function");
    expect(client.AppShellClient).toBeTypeOf("function");
    expect(server.parseAppShellChrome).toBe(root.parseAppShellChrome);
  });
});
