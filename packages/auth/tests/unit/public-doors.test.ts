import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDirname = dirname(fileURLToPath(import.meta.url));

describe("auth public doors", () => {
  it("keeps developer sign-in server UI out of the client door", () => {
    const clientDoor = readFileSync(
      resolve(testDirname, "../../src/client.ts"),
      "utf8",
    );

    expect(clientDoor).not.toContain("DevSignInFloatingPanel");
    expect(clientDoor).not.toContain("DevSignInForm");
    expect(clientDoor).not.toContain("./dev/");
  });
});
