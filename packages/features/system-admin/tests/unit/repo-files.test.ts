import { describe, expect, it } from "vitest";
import { resolveRepoRootFile } from "../../src/lib/repo-files.server";

describe("resolveRepoRootFile", () => {
  it("locates vercel.json from the monorepo root", async () => {
    const path = await resolveRepoRootFile("vercel.json");
    expect(path.endsWith("vercel.json")).toBe(true);
  });
});
